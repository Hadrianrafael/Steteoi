import { ADJACENT_DIST, distance, type GameMap, type Territory } from "./maps";

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

export const MAX_TROOPS = 50;
export const TROOP_INTERVAL_MS = 1500;

export function createGame(map: GameMap, numPlayers: number): GameState {
  const owners: Owner[] = ["player", "ai1", "ai2", "ai3", "ai4"].slice(
    0,
    numPlayers,
  ) as Owner[];

  const states: Record<string, TerritoryState> = {};
  const territories = [...map.territories];
  for (let i = territories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [territories[i], territories[j]] = [territories[j]!, territories[i]!];
  }

  territories.forEach((t, idx) => {
    const owner: Owner = idx < owners.length ? owners[idx]! : "neutral";
    states[t.id] = {
      id: t.id,
      owner,
      troops: owner === "neutral" ? 4 + Math.floor(Math.random() * 5) : 12,
    };
  });

  return {
    map,
    states,
    players: owners,
    finished: false,
    winner: null,
  };
}

export function tickTroops(state: GameState, growthBonus = 0): GameState {
  const newStates: Record<string, TerritoryState> = {};
  for (const id in state.states) {
    const s = state.states[id]!;
    if (s.owner === "neutral") {
      newStates[id] = s;
    } else {
      const inc = s.owner === "player" ? 1 + growthBonus : 1;
      newStates[id] = {
        ...s,
        troops: Math.min(MAX_TROOPS, s.troops + inc),
      };
    }
  }
  return { ...state, states: newStates };
}

export type AttackOutcome = {
  state: GameState;
  conquered: boolean;
  attackerSurvived: number;
  defenderSurvived: number;
};

export function resolveAttack(
  state: GameState,
  fromId: string,
  toId: string,
  sending: number,
  attackBonus = 0,
): AttackOutcome {
  const from = state.states[fromId]!;
  const to = state.states[toId]!;
  const newStates = { ...state.states };
  const remaining = from.troops - sending;

  if (to.owner === from.owner) {
    newStates[fromId] = { ...from, troops: remaining };
    newStates[toId] = {
      ...to,
      troops: Math.min(MAX_TROOPS, to.troops + sending),
    };
    return {
      state: { ...state, states: newStates },
      conquered: false,
      attackerSurvived: sending,
      defenderSurvived: to.troops,
    };
  }

  let atk = sending;
  let def = to.troops;
  // Attacker bonus reduces defender slight advantage
  const atkWinChance = 0.55 + attackBonus;
  while (atk > 0 && def > 0) {
    const r = Math.random();
    if (r < atkWinChance) def--;
    else atk--;
  }
  if (atk > 0) {
    newStates[fromId] = { ...from, troops: remaining };
    newStates[toId] = { ...to, owner: from.owner, troops: atk };
    return {
      state: { ...state, states: newStates },
      conquered: true,
      attackerSurvived: atk,
      defenderSurvived: 0,
    };
  } else {
    newStates[fromId] = { ...from, troops: remaining };
    newStates[toId] = { ...to, troops: def };
    return {
      state: { ...state, states: newStates },
      conquered: false,
      attackerSurvived: 0,
      defenderSurvived: def,
    };
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

export type AiAction = {
  fromId: string;
  toId: string;
  sending: number;
  isPlane: boolean;
};

export function chooseAiAction(state: GameState, who: Owner): AiAction | null {
  const myTerritories = state.map.territories.filter(
    (t) => state.states[t.id]?.owner === who,
  );
  if (myTerritories.length === 0) return null;

  type Move = {
    from: Territory;
    to: Territory;
    score: number;
  };
  const moves: Move[] = [];

  for (const from of myTerritories) {
    const fromState = state.states[from.id]!;
    if (fromState.troops < 5) continue;
    const sending = Math.floor(fromState.troops * 0.7);

    for (const to of state.map.territories) {
      if (to.id === from.id) continue;
      const toState = state.states[to.id]!;
      const dist = distance(from, to);
      const isPlane = dist > ADJACENT_DIST;

      if (toState.owner === who) continue;

      // Strong bias toward nearby weak enemies
      const distancePenalty = dist / 30;
      const advantage = sending - toState.troops;
      const score = 12 + advantage * 3 - distancePenalty - (isPlane ? 4 : 0);

      if (sending > toState.troops - 3) {
        moves.push({ from, to, score });
      }
    }
  }

  if (moves.length === 0) return null;
  moves.sort((a, b) => b.score - a.score);
  // Slight randomness among top picks
  const top = moves.slice(0, 3);
  const pick = top[Math.floor(Math.random() * top.length)]!;
  const fromState = state.states[pick.from.id]!;
  const sending = Math.floor(fromState.troops * 0.7);
  return {
    fromId: pick.from.id,
    toId: pick.to.id,
    sending,
    isPlane: distance(pick.from, pick.to) > ADJACENT_DIST,
  };
}
