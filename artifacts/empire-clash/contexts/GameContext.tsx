import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
};

const DEFAULT_PROFILE: Profile = {
  name: "Comandante",
  level: 1,
  xp: 0,
  coins: 1500,
  gems: 50,
  energy: 5,
  maxEnergy: 5,
  league: "Bronze",
  trophies: 0,
  totalWins: 0,
  ownedSkins: ["classic"],
  selectedSkin: "classic",
  planeTier: 1,
  upgGrowth: 0,
  upgAttack: 0,
  upgStart: 0,
  upgPlaneSpeed: 0,
  skillNuke: 1,
  skillRally: 2,
  skillShield: 1,
  skillSpy: 1,
  skillFury: 1,
  skillFreeze: 1,
  vipActive: false,
  dailyLoginDay: 0,
  lastLoginDate: null,
  seasonPoints: 0,
};

const STORAGE_KEY = "@empire_clash_profile_v3";

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
  upgrade: (key: "upgGrowth" | "upgAttack" | "upgStart" | "upgPlaneSpeed") => boolean;
  buySkill: (key: SkillKey, cost: number) => boolean;
  useSkill: (key: SkillKey) => boolean;
  activateVip: () => void;
  claimDailyLogin: () => { reward: number; type: "coins" | "gems" } | null;
  reset: () => void;
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
  upgGrowth: (lvl: number) => 500 + lvl * 400,
  upgAttack: (lvl: number) => 700 + lvl * 500,
  upgStart: (lvl: number) => 600 + lvl * 450,
  upgPlaneSpeed: (lvl: number) => 800 + lvl * 600,
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

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Profile>;
          setProfile({ ...DEFAULT_PROFILE, ...parsed });
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
    setProfile((p) => ({ ...p, energy: Math.min(p.maxEnergy, p.energy + n) }));

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

  const buySkin = (id: string, cost: number, currency: "coins" | "gems") => {
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
    setProfile((p) => ({ ...p, coins: p.coins - cost, planeTier: next }));
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
    setProfile((p) => ({ ...p, vipActive: true, maxEnergy: 10, energy: 10 }));

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
      gems: type === "gems" ? p.gems + Math.floor(reward / 10) : p.gems,
    }));
    return {
      reward: type === "gems" ? Math.floor(reward / 10) : reward,
      type,
    };
  };

  const reset = () => {
    setProfile(DEFAULT_PROFILE);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

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
        upgrade,
        buySkill,
        useSkill,
        activateVip,
        claimDailyLogin,
        reset,
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
