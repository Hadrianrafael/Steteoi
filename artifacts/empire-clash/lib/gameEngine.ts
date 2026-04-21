import type { GameMap, Territory } from "./maps";

export type Owner = "player" | "ai1" | "ai2" | "ai3" | "ai4" | "neutral";

export type TerritoryState = {
  id: string;
  owner: Owner;
  troops: number;
};

export type GameState = {
  map: GameMap;
  states: Record<string, TerritoryState>;
  players: Owner[];
  turn: number;
  finished: boolean;
  winner: Owner | null;
};

export const PLAYER_COLORS: Record<Owner, string> = {
  player: "#E63946",
  ai1: "#3FD0FF",
  ai2: "#FFB300",
  ai3: "#8A4FFF",
  ai4: "#2ECC71",
  neutral: "#4A4A6E",
};

export const PLAYER_NAMES: Record<Owner, string> = {
  player: "Você",
  ai1: "Aurora",
  ai2: "Khan",
  ai3: "Volkov",
  ai4: "Rex",
  neutral: "Neutro",
};

export const MAX_TROOPS = 30;
export const TROOP_INTERVAL_MS = 1500;

export function createGame(map: GameMap, numPlayers: number): GameState {
  const owners: Owner[] = ["player", "ai1", "ai2", "ai3", "ai4"].slice(
    0,
    numPlayers,
  ) as Owner[];

  const states: Record<string, TerritoryState> = {};
  const territories = [...map.territories];
  // Shuffle deterministically-ish
  for (let i = territories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [territories[i], territories[j]] = [territories[j]!, territories[i]!];
  }

  // Assign starting territories: 1 per player, rest neutral
  territories.forEach((t, idx) => {
    const owner: Owner = idx < owners.length ? owners[idx]! : "neutral";
    states[t.id] = {
      id: t.id,
      owner,
      troops: owner === "neutral" ? 3 + Math.floor(Math.random() * 4) : 8,
    };
  });

  return {
    map,
    states,
    players: owners,
    turn: 0,
    finished: false,
    winner: null,
  };
}

export function tickTroops(state: GameState): GameState {
  const newStates: Record<string, TerritoryState> = {};
  for (const id in state.states) {
    const s = state.states[id]!;
    if (s.owner === "neutral") {
      newStates[id] = s;
    } else {
      newStates[id] = {
        ...s,
        troops: Math.min(MAX_TROOPS, s.troops + 1),
      };
    }
  }
  return { ...state, states: newStates };
}

export function attack(
  state: GameState,
  fromId: string,
  toId: string,
): { state: GameState; success: boolean; message: string } {
  const from = state.states[fromId];
  const to = state.states[toId];
  const fromTerr = state.map.territories.find((t) => t.id === fromId);
  if (!from || !to || !fromTerr) {
    return { state, success: false, message: "inválido" };
  }
  if (!fromTerr.adj.includes(toId)) {
    return { state, success: false, message: "Território não adjacente" };
  }
  if (from.troops < 2) {
    return { state, success: false, message: "Tropas insuficientes" };
  }

  const sending = Math.floor(from.troops / 2);
  const remaining = from.troops - sending;
  const newStates = { ...state.states };

  if (to.owner === from.owner) {
    // Reinforce
    newStates[fromId] = { ...from, troops: remaining };
    newStates[toId] = {
      ...to,
      troops: Math.min(MAX_TROOPS, to.troops + sending),
    };
    return {
      state: { ...state, states: newStates },
      success: true,
      message: "Reforçado",
    };
  } else {
    // Battle: simple stochastic
    let atk = sending;
    let def = to.troops;
    while (atk > 0 && def > 0) {
      const r = Math.random();
      // Defender slight advantage
      if (r < 0.45) atk--;
      else def--;
    }
    if (atk > 0) {
      newStates[fromId] = { ...from, troops: remaining };
      newStates[toId] = { ...to, owner: from.owner, troops: atk };
      return {
        state: { ...state, states: newStates },
        success: true,
        message: "Conquistado!",
      };
    } else {
      newStates[fromId] = { ...from, troops: remaining };
      newStates[toId] = { ...to, troops: def };
      return {
        state: { ...state, states: newStates },
        success: true,
        message: "Atacado",
      };
    }
  }
}

export function checkWinner(state: GameState): Owner | null {
  const counts: Partial<Record<Owner, number>> = {};
  for (const id in state.states) {
    const o = state.states[id]!.owner;
    if (o === "neutral") continue;
    counts[o] = (counts[o] ?? 0) + 1;
  }
  const active = Object.keys(counts) as Owner[];
  if (active.length === 1) return active[0]!;
  return null;
}

export function aiMove(state: GameState, who: Owner): GameState {
  const myTerritories = state.map.territories.filter(
    (t) => state.states[t.id]?.owner === who,
  );
  if (myTerritories.length === 0) return state;

  // Find candidate moves: my territory with troops>=4 attacking weakest neighbor
  type Move = {
    from: Territory;
    to: Territory;
    score: number;
    isAttack: boolean;
  };
  const moves: Move[] = [];

  for (const from of myTerritories) {
    const fromState = state.states[from.id]!;
    if (fromState.troops < 4) continue;
    for (const adjId of from.adj) {
      const to = state.map.territories.find((t) => t.id === adjId);
      if (!to) continue;
      const toState = state.states[adjId]!;
      const sending = Math.floor(fromState.troops / 2);
      if (toState.owner === who) {
        // Reinforce only if adjacent enemies present
        const hasEnemyNbr = to.adj.some((id) => {
          const o = state.states[id]?.owner;
          return o && o !== who && o !== "neutral";
        });
        if (hasEnemyNbr && toState.troops < 8) {
          moves.push({ from, to, score: 5, isAttack: false });
        }
      } else {
        // Attack: better if our send > their troops
        const advantage = sending - toState.troops;
        const score = 10 + advantage * 3;
        if (sending > toState.troops - 2) {
          moves.push({ from, to, score, isAttack: true });
        }
      }
    }
  }

  if (moves.length === 0) return state;
  moves.sort((a, b) => b.score - a.score);
  const best = moves[0]!;
  const result = attack(state, best.from.id, best.to.id);
  return result.state;
}
