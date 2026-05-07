import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type PlaneTier = 1 | 2 | 3 | 4 | 5;

export type SkillKey =
  | "skillNuke"
  | "skillRally"
  | "skillShield"
  | "skillSpy"
  | "skillFury"
  | "skillFreeze";

// ── Cards ─────────────────────────────────────────────────────────────────────
export type CardColor = "blue" | "red" | "yellow";
export type CardRarity =
  | "legendary"
  | "epic"
  | "rare"
  | "uncommon"
  | "common";

export type CardDef = {
  id: string;
  color: CardColor;
  rarity: CardRarity;
  name: string;
  description: string;
  bonus: string;
};

export const CARD_DEFS: CardDef[] = [
  // Blue (rarest)
  { id: "b_legendary", color: "blue", rarity: "legendary", name: "Armada Celestial", description: "Frota lendária de combate aéreo", bonus: "+25% velocidade de ataque" },
  { id: "b_epic",      color: "blue", rarity: "epic",      name: "Escudo Tático",     description: "Defesa épica de território",       bonus: "+20% resistência" },
  { id: "b_rare",      color: "blue", rarity: "rare",      name: "Radar Avançado",    description: "Detecção antecipada de ameaças",   bonus: "+15% visibilidade" },
  // Red
  { id: "r_epic",      color: "red",  rarity: "epic",      name: "Bombardeiro X",     description: "Ataque aéreo massivo",             bonus: "+18% dano de ataque" },
  { id: "r_rare",      color: "red",  rarity: "rare",      name: "Artilharia Pesada", description: "Canhões de longo alcance",         bonus: "+12% alcance" },
  { id: "r_common",    color: "red",  rarity: "common",    name: "Infantaria Elite",  description: "Tropas treinadas de combate",      bonus: "+8% produção de tropas" },
  // Yellow
  { id: "y_rare",      color: "yellow", rarity: "rare",    name: "Mina de Ouro",      description: "Produção acelerada de moedas",     bonus: "+10% moedas por vitória" },
  { id: "y_uncommon",  color: "yellow", rarity: "uncommon", name: "Mercador",          description: "Desconto na loja",                 bonus: "-5% preços na loja" },
  { id: "y_common",    color: "yellow", rarity: "common",  name: "Recruta",           description: "Soldado básico de apoio",           bonus: "+5% crescimento de tropas" },
];

// Drop weights: blue = rare, red = medium, yellow = common
export const CARD_DROP_TABLE: { id: string; weight: number }[] = [
  { id: "b_legendary", weight: 1 },
  { id: "b_epic",      weight: 3 },
  { id: "b_rare",      weight: 8 },
  { id: "r_epic",      weight: 10 },
  { id: "r_rare",      weight: 18 },
  { id: "r_common",    weight: 30 },
  { id: "y_rare",      weight: 20 },
  { id: "y_uncommon",  weight: 40 },
  { id: "y_common",    weight: 70 },
];

export function rollCard(): string {
  const total = CARD_DROP_TABLE.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const entry of CARD_DROP_TABLE) {
    r -= entry.weight;
    if (r <= 0) return entry.id;
  }
  return CARD_DROP_TABLE[CARD_DROP_TABLE.length - 1].id;
}

// ── Missions ──────────────────────────────────────────────────────────────────
export type MissionType = "daily" | "weekly" | "monthly";

export type MissionDef = {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  goal: number;
  stat: keyof MissionStats;
  reward: { coins?: number; gems?: number; cards?: number };
};

export type MissionStats = {
  gamesPlayed: number;
  gamesWon: number;
  coinsEarned: number;
  territoriesCaptured: number;
};

export const MISSION_DEFS: MissionDef[] = [
  // Daily
  { id: "d_play2",    type: "daily",   title: "Guerreiro Diário",    description: "Jogue 2 partidas",              goal: 2,  stat: "gamesPlayed",       reward: { coins: 200 } },
  { id: "d_win1",     type: "daily",   title: "Primeira Vitória",    description: "Vença 1 partida",               goal: 1,  stat: "gamesWon",          reward: { coins: 300, cards: 1 } },
  { id: "d_coins",    type: "daily",   title: "Comerciante",         description: "Ganhe 500 moedas em partidas",  goal: 500, stat: "coinsEarned",      reward: { gems: 3 } },
  // Weekly
  { id: "w_play10",   type: "weekly",  title: "Veterano",            description: "Jogue 10 partidas",             goal: 10, stat: "gamesPlayed",       reward: { coins: 1500, cards: 2 } },
  { id: "w_win5",     type: "weekly",  title: "Conquistador",        description: "Vença 5 partidas",              goal: 5,  stat: "gamesWon",          reward: { gems: 15, cards: 3 } },
  { id: "w_territory",type: "weekly",  title: "Expansionista",       description: "Capture 50 territórios",        goal: 50, stat: "territoriesCaptured", reward: { coins: 2000 } },
  // Monthly
  { id: "m_play50",   type: "monthly", title: "Lenda do Campo",      description: "Jogue 50 partidas",             goal: 50, stat: "gamesPlayed",       reward: { coins: 5000, gems: 20, cards: 5 } },
  { id: "m_win20",    type: "monthly", title: "Grande Conquistador",  description: "Vença 20 partidas",            goal: 20, stat: "gamesWon",          reward: { gems: 50, cards: 8 } },
];

function getMissionPeriodKey(type: MissionType): string {
  const now = new Date();
  if (type === "daily") return now.toDateString();
  if (type === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return `week-${start.toDateString()}`;
  }
  return `month-${now.getFullYear()}-${now.getMonth()}`;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export type Profile = {
  name: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  league: "Bronze" | "Prata" | "Ouro" | "Diamante" | "Mestre" | "Lendário";
  trophies: number;
  totalWins: number;
  ownedSkins: string[];
  selectedSkin: string;
  planeTier: PlaneTier;
  planeShards: Record<string, number>;
  planeLevels: Record<string, number>;
  upgGrowth: number;
  upgAttack: number;
  upgStart: number;
  upgPlaneSpeed: number;
  skillNuke: number;
  skillRally: number;
  skillShield: number;
  skillSpy: number;
  skillFury: number;
  skillFreeze: number;
  vipActive: boolean;
  dailyLoginDay: number;
  lastLoginDate: string | null;
  seasonPoints: number;
  // Cards
  cards: Record<string, number>;
  // Missions
  missionProgress: Record<string, number>;
  missionClaimed: Record<string, string>; // missionId -> periodKey when claimed
  missionStats: MissionStats;
  missionStatsPeriod: Record<MissionType, string>; // last period key for stats reset
  // Offline
  lastActiveTs: number;
};

const DEFAULT_PROFILE: Profile = {
  name: "Comandante",
  level: 1,
  xp: 0,
  coins: 500,
  gems: 10,
  energy: 30,
  maxEnergy: 30,
  league: "Bronze",
  trophies: 0,
  totalWins: 0,
  ownedSkins: ["classic"],
  selectedSkin: "classic",
  planeTier: 1,
  planeShards: { "1": 10, "2": 0, "3": 0, "4": 0, "5": 0 },
  planeLevels: { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 },
  upgGrowth: 0,
  upgAttack: 0,
  upgStart: 0,
  upgPlaneSpeed: 0,
  skillNuke: 0,
  skillRally: 0,
  skillShield: 0,
  skillSpy: 0,
  skillFury: 0,
  skillFreeze: 0,
  vipActive: false,
  dailyLoginDay: 0,
  lastLoginDate: null,
  seasonPoints: 0,
  cards: {},
  missionProgress: {},
  missionClaimed: {},
  missionStats: { gamesPlayed: 0, gamesWon: 0, coinsEarned: 0, territoriesCaptured: 0 },
  missionStatsPeriod: { daily: "", weekly: "", monthly: "" },
  lastActiveTs: Date.now(),
};

const STORAGE_KEY = "@empire_clash_profile_v6";

// ── Offline reward calculation ─────────────────────────────────────────────────
const OFFLINE_COINS_PER_HOUR = 60;
const OFFLINE_CARDS_PER_6H = 1;
const MAX_OFFLINE_HOURS = 12;

export type OfflineReward = {
  hoursAway: number;
  coins: number;
  cards: string[];
};

export function calcOfflineReward(lastActiveTs: number): OfflineReward | null {
  const nowTs = Date.now();
  const diffMs = nowTs - lastActiveTs;
  const diffHours = Math.min(diffMs / (1000 * 60 * 60), MAX_OFFLINE_HOURS);
  if (diffHours < 0.5) return null;
  const coins = Math.floor(diffHours * OFFLINE_COINS_PER_HOUR);
  const cardCount = Math.floor(diffHours / 6) * OFFLINE_CARDS_PER_6H;
  const cards: string[] = [];
  for (let i = 0; i < cardCount; i++) cards.push(rollCard());
  return { hoursAway: Math.floor(diffHours), coins, cards };
}

// ── Context types ─────────────────────────────────────────────────────────────
type Ctx = {
  profile: Profile;
  ready: boolean;
  addCoins: (n: number) => void;
  addGems: (n: number) => void;
  spendCoins: (n: number) => boolean;
  spendGems: (n: number) => boolean;
  addXp: (n: number) => { leveledUp: boolean; newLevel: number };
  consumeEnergy: (n: number) => boolean;
  refillEnergy: () => void;
  addEnergy: (n: number) => void;
  addTrophies: (n: number) => void;
  addWin: () => void;
  buySkin: (id: string, cost: number, currency: "coins" | "gems") => boolean;
  selectSkin: (id: string) => void;
  upgradePlane: () => boolean;
  addPlaneShards: (tier: PlaneTier, n: number) => void;
  unlockPlane: (tier: PlaneTier, freeFromAd?: boolean) => boolean;
  levelUpPlane: (tier: PlaneTier, freeFromAd?: boolean) => boolean;
  equipPlane: (tier: PlaneTier) => boolean;
  upgrade: (key: "upgGrowth" | "upgAttack" | "upgStart" | "upgPlaneSpeed") => boolean;
  freeUpgrade: (key: "upgGrowth" | "upgAttack" | "upgStart" | "upgPlaneSpeed") => boolean;
  buySkill: (key: SkillKey, cost: number) => boolean;
  useSkill: (key: SkillKey) => boolean;
  activateVip: () => void;
  claimDailyLogin: () => { reward: number; type: "coins" | "gems" } | null;
  enemyCountForLevel: () => number;
  multiplayerUnlocked: boolean;
  reset: () => void;
  // Cards
  addCards: (cardIds: string[]) => void;
  // Missions
  getMissions: (type: MissionType) => Array<MissionDef & { progress: number; claimed: boolean; periodKey: string }>;
  claimMission: (missionId: string) => boolean;
  recordMissionStat: (stat: keyof MissionStats, amount: number) => void;
  // Offline
  pendingOfflineReward: OfflineReward | null;
  claimOfflineReward: (doubled: boolean) => void;
  touchActiveTs: () => void;
  // Profile meta
  setName: (name: string) => void;
  isFirstLaunch: boolean;
};

const GameCtx = createContext<Ctx | null>(null);

function leagueFor(trophies: number): Profile["league"] {
  if (trophies >= 4000) return "Lendário";
  if (trophies >= 2500) return "Mestre";
  if (trophies >= 1500) return "Diamante";
  if (trophies >= 800) return "Ouro";
  if (trophies >= 300) return "Prata";
  return "Bronze";
}

function xpForLevel(level: number) {
  return level * 100;
}

export const UPGRADE_COSTS = {
  upgGrowth:    (lvl: number) => 500  + lvl * 400,
  upgAttack:    (lvl: number) => 700  + lvl * 500,
  upgStart:     (lvl: number) => 600  + lvl * 450,
  upgPlaneSpeed:(lvl: number) => 800  + lvl * 600,
};

export const PLANE_COSTS: Record<PlaneTier, number> = {
  1: 0,
  2: 2000,
  3: 6000,
  4: 14000,
  5: 30000,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [pendingOfflineReward, setPendingOfflineReward] =
    useState<OfflineReward | null>(null);
  const offlineChecked = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Profile>;
          const merged: Profile = { ...DEFAULT_PROFILE, ...parsed };

          // Check offline reward before setting profile
          if (!offlineChecked.current) {
            offlineChecked.current = true;
            const reward = calcOfflineReward(
              merged.lastActiveTs ?? Date.now() - 1000 * 60 * 60,
            );
            if (reward) setPendingOfflineReward(reward);
          }

          merged.lastActiveTs = Date.now();
          setProfile(merged);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
  }, [profile, ready]);

  const addCoins = (n: number) =>
    setProfile((p) => ({ ...p, coins: p.coins + n }));
  const addGems = (n: number) =>
    setProfile((p) => ({ ...p, gems: p.gems + n }));

  const spendCoins = useCallback(
    (n: number) => {
      if (profile.coins < n) return false;
      setProfile((p) => ({ ...p, coins: p.coins - n }));
      return true;
    },
    [profile.coins],
  );
  const spendGems = useCallback(
    (n: number) => {
      if (profile.gems < n) return false;
      setProfile((p) => ({ ...p, gems: p.gems - n }));
      return true;
    },
    [profile.gems],
  );

  const consumeEnergy = useCallback(
    (n: number) => {
      if (profile.energy < n) return false;
      setProfile((p) => ({ ...p, energy: p.energy - n }));
      return true;
    },
    [profile.energy],
  );

  const refillEnergy = () =>
    setProfile((p) => ({ ...p, energy: p.maxEnergy }));

  const addEnergy = (n: number) =>
    setProfile((p) => ({
      ...p,
      energy: Math.min(p.maxEnergy, p.energy + n),
    }));

  const addXp = (n: number) => {
    let leveledUp = false;
    let newLevel = profile.level;
    setProfile((p) => {
      let xp = p.xp + n;
      let level = p.level;
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
        leveledUp = true;
      }
      newLevel = level;
      return { ...p, xp, level };
    });
    return { leveledUp, newLevel };
  };

  const addTrophies = (n: number) =>
    setProfile((p) => {
      const trophies = Math.max(0, p.trophies + n);
      return {
        ...p,
        trophies,
        league: leagueFor(trophies),
        seasonPoints: Math.max(0, p.seasonPoints + n),
      };
    });

  const addWin = () =>
    setProfile((p) => ({ ...p, totalWins: p.totalWins + 1 }));

  const buySkin = (
    id: string,
    cost: number,
    currency: "coins" | "gems",
  ) => {
    if (profile.ownedSkins.includes(id)) return false;
    if (currency === "coins") {
      if (profile.coins < cost) return false;
      setProfile((p) => ({
        ...p,
        coins: p.coins - cost,
        ownedSkins: [...p.ownedSkins, id],
      }));
    } else {
      if (profile.gems < cost) return false;
      setProfile((p) => ({
        ...p,
        gems: p.gems - cost,
        ownedSkins: [...p.ownedSkins, id],
      }));
    }
    return true;
  };

  const selectSkin = (id: string) =>
    setProfile((p) =>
      p.ownedSkins.includes(id) ? { ...p, selectedSkin: id } : p,
    );

  const upgradePlane = () => {
    if (profile.planeTier >= 5) return false;
    const next = (profile.planeTier + 1) as PlaneTier;
    const cost = PLANE_COSTS[next];
    if (profile.coins < cost) return false;
    setProfile((p) => ({
      ...p,
      coins: p.coins - cost,
      planeTier: next,
      planeLevels: {
        ...p.planeLevels,
        [String(next)]: Math.max(p.planeLevels[String(next)] ?? 0, 1),
      },
    }));
    return true;
  };

  const addPlaneShards = (tier: PlaneTier, n: number) =>
    setProfile((p) => ({
      ...p,
      planeShards: {
        ...p.planeShards,
        [String(tier)]: (p.planeShards[String(tier)] ?? 0) + n,
      },
    }));

  const unlockPlane = (tier: PlaneTier, freeFromAd = false) => {
    const k = String(tier);
    const shards = profile.planeShards[k] ?? 0;
    const lvl = profile.planeLevels[k] ?? 0;
    if (lvl > 0) return false;
    if (shards < 10) return false;
    const cost = PLANE_COSTS[tier];
    if (!freeFromAd && profile.coins < cost) return false;
    setProfile((p) => ({
      ...p,
      coins: freeFromAd ? p.coins : p.coins - cost,
      planeShards: { ...p.planeShards, [k]: shards - 10 },
      planeLevels: { ...p.planeLevels, [k]: 1 },
    }));
    return true;
  };

  const levelUpPlane = (tier: PlaneTier, freeFromAd = false) => {
    const k = String(tier);
    const shards = profile.planeShards[k] ?? 0;
    const lvl = profile.planeLevels[k] ?? 0;
    if (lvl < 1 || lvl >= 10) return false;
    if (shards < 5) return false;
    const cost = Math.round(PLANE_COSTS[tier] * 0.3 * lvl);
    if (!freeFromAd && profile.coins < cost) return false;
    setProfile((p) => ({
      ...p,
      coins: freeFromAd ? p.coins : p.coins - cost,
      planeShards: { ...p.planeShards, [k]: shards - 5 },
      planeLevels: { ...p.planeLevels, [k]: lvl + 1 },
    }));
    return true;
  };

  const equipPlane = (tier: PlaneTier) => {
    const lvl = profile.planeLevels[String(tier)] ?? 0;
    if (lvl < 1) return false;
    setProfile((p) => ({ ...p, planeTier: tier }));
    return true;
  };

  const upgrade = (
    key: "upgGrowth" | "upgAttack" | "upgStart" | "upgPlaneSpeed",
  ) => {
    const lvl = profile[key];
    if (lvl >= 5) return false;
    const cost = UPGRADE_COSTS[key](lvl);
    if (profile.coins < cost) return false;
    setProfile((p) => ({ ...p, coins: p.coins - cost, [key]: lvl + 1 }));
    return true;
  };

  const freeUpgrade = (
    key: "upgGrowth" | "upgAttack" | "upgStart" | "upgPlaneSpeed",
  ) => {
    const lvl = profile[key];
    if (lvl >= 5) return false;
    setProfile((p) => ({ ...p, [key]: lvl + 1 }));
    return true;
  };

  const buySkill = (key: SkillKey, cost: number) => {
    if (profile.gems < cost) return false;
    setProfile((p) => ({ ...p, gems: p.gems - cost, [key]: p[key] + 1 }));
    return true;
  };

  const useSkill = (key: SkillKey) => {
    if (profile[key] <= 0) return false;
    setProfile((p) => ({ ...p, [key]: p[key] - 1 }));
    return true;
  };

  const activateVip = () =>
    setProfile((p) => ({ ...p, vipActive: true, maxEnergy: 60, energy: 60 }));

  const claimDailyLogin = () => {
    const today = new Date().toDateString();
    if (profile.lastLoginDate === today) return null;
    const day = (profile.dailyLoginDay % 7) + 1;
    const reward = day * 100;
    const type: "coins" | "gems" = day === 7 ? "gems" : "coins";
    setProfile((p) => ({
      ...p,
      dailyLoginDay: day,
      lastLoginDate: today,
      coins: type === "coins" ? p.coins + reward : p.coins,
      gems:
        type === "gems" ? p.gems + Math.floor(reward / 10) : p.gems,
    }));
    return {
      reward: type === "gems" ? Math.floor(reward / 10) : reward,
      type,
    };
  };

  // ── Cards ────────────────────────────────────────────────────────────────
  const addCards = (cardIds: string[]) => {
    setProfile((p) => {
      const cards = { ...p.cards };
      for (const id of cardIds) {
        cards[id] = (cards[id] ?? 0) + 1;
      }
      return { ...p, cards };
    });
  };

  // ── Missions ─────────────────────────────────────────────────────────────
  const getMissions = (type: MissionType) => {
    return MISSION_DEFS.filter((m) => m.type === type).map((m) => {
      const periodKey = getMissionPeriodKey(type);
      const progress = profile.missionProgress[`${m.id}__${periodKey}`] ?? 0;
      const claimed = profile.missionClaimed[m.id] === periodKey;
      return { ...m, progress, claimed, periodKey };
    });
  };

  const claimMission = (missionId: string): boolean => {
    const def = MISSION_DEFS.find((m) => m.id === missionId);
    if (!def) return false;
    const periodKey = getMissionPeriodKey(def.type);
    const progress =
      profile.missionProgress[`${missionId}__${periodKey}`] ?? 0;
    const claimed = profile.missionClaimed[missionId] === periodKey;
    if (claimed || progress < def.goal) return false;

    setProfile((p) => {
      const cards = { ...p.cards };
      const cardCount = def.reward.cards ?? 0;
      for (let i = 0; i < cardCount; i++) {
        const id = rollCard();
        cards[id] = (cards[id] ?? 0) + 1;
      }
      return {
        ...p,
        coins: p.coins + (def.reward.coins ?? 0),
        gems: p.gems + (def.reward.gems ?? 0),
        cards,
        missionClaimed: { ...p.missionClaimed, [missionId]: periodKey },
      };
    });
    return true;
  };

  const recordMissionStat = (stat: keyof MissionStats, amount: number) => {
    setProfile((p) => {
      const updatedProgress = { ...p.missionProgress };
      for (const def of MISSION_DEFS) {
        if (def.stat !== stat) continue;
        const periodKey = getMissionPeriodKey(def.type);
        const key = `${def.id}__${periodKey}`;
        updatedProgress[key] = Math.min(
          (updatedProgress[key] ?? 0) + amount,
          def.goal,
        );
      }
      return {
        ...p,
        missionStats: { ...p.missionStats, [stat]: p.missionStats[stat] + amount },
        missionProgress: updatedProgress,
      };
    });
  };

  // ── Offline rewards ───────────────────────────────────────────────────────
  const claimOfflineReward = (doubled: boolean) => {
    if (!pendingOfflineReward) return;
    const { coins, cards } = pendingOfflineReward;
    const mult = doubled ? 2 : 1;
    setProfile((p) => {
      const updatedCards = { ...p.cards };
      const allCards = doubled ? [...cards, ...cards] : cards;
      for (const id of allCards) {
        updatedCards[id] = (updatedCards[id] ?? 0) + 1;
      }
      return {
        ...p,
        coins: p.coins + coins * mult,
        cards: updatedCards,
        lastActiveTs: Date.now(),
      };
    });
    setPendingOfflineReward(null);
  };

  const touchActiveTs = () => {
    setProfile((p) => ({ ...p, lastActiveTs: Date.now() }));
  };

  const reset = () => {
    setProfile(DEFAULT_PROFILE);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const setName = (name: string) =>
    setProfile((p) => ({
      ...p,
      name: name.trim() || "Comandante",
      // Mark as no longer first launch (use sentinel date ≠ today so daily login still triggers)
      lastLoginDate: lastLoginDate === null ? "first-launch-done" : p.lastLoginDate,
    }));

  const lastLoginDate = profile.lastLoginDate;

  return (
    <GameCtx.Provider
      value={{
        profile,
        ready,
        addCoins,
        addGems,
        spendCoins,
        spendGems,
        addXp,
        consumeEnergy,
        refillEnergy,
        addEnergy,
        addTrophies,
        addWin,
        buySkin,
        selectSkin,
        upgradePlane,
        addPlaneShards,
        unlockPlane,
        levelUpPlane,
        equipPlane,
        upgrade,
        freeUpgrade,
        buySkill,
        useSkill,
        activateVip,
        claimDailyLogin,
        enemyCountForLevel: () => {
          if (profile.level <= 5) return 3;
          if (profile.level <= 10) return 4;
          return 5;
        },
        multiplayerUnlocked: profile.level >= 10,
        reset,
        addCards,
        getMissions,
        claimMission,
        recordMissionStat,
        pendingOfflineReward,
        claimOfflineReward,
        touchActiveTs,
        setName,
        isFirstLaunch: profile.lastLoginDate === null,
      }}
    >
      {children}
    </GameCtx.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export function xpProgress(p: Profile) {
  return p.xp / xpForLevel(p.level);
}
