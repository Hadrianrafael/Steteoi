import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Profile = {
  name: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  league: "Bronze" | "Prata" | "Ouro" | "Diamante";
  trophies: number;
  campaignProgress: number;
  unlockedMaps: string[];
  ownedSkins: string[];
  selectedSkin: string;
  dailyLoginDay: number;
  lastLoginDate: string | null;
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
  campaignProgress: 1,
  unlockedMaps: ["usa", "br"],
  ownedSkins: ["classic"],
  selectedSkin: "classic",
  dailyLoginDay: 0,
  lastLoginDate: null,
};

const STORAGE_KEY = "@empire_clash_profile_v1";

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
  addTrophies: (n: number) => void;
  unlockMap: (id: string) => void;
  buySkin: (id: string, cost: number, currency: "coins" | "gems") => boolean;
  selectSkin: (id: string) => void;
  advanceCampaign: () => void;
  claimDailyLogin: () => { reward: number; type: "coins" | "gems" } | null;
  reset: () => void;
};

const GameCtx = createContext<Ctx | null>(null);

function leagueFor(trophies: number): Profile["league"] {
  if (trophies >= 1500) return "Diamante";
  if (trophies >= 800) return "Ouro";
  if (trophies >= 300) return "Prata";
  return "Bronze";
}

function xpForLevel(level: number) {
  return level * 100;
}

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

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const addCoins = (n: number) =>
    setProfile((p) => ({ ...p, coins: p.coins + n }));
  const addGems = (n: number) =>
    setProfile((p) => ({ ...p, gems: p.gems + n }));

  const spendCoins = (n: number) => {
    if (profile.coins < n) return false;
    setProfile((p) => ({ ...p, coins: p.coins - n }));
    return true;
  };
  const spendGems = (n: number) => {
    if (profile.gems < n) return false;
    setProfile((p) => ({ ...p, gems: p.gems - n }));
    return true;
  };

  const consumeEnergy = (n: number) => {
    if (profile.energy < n) return false;
    setProfile((p) => ({ ...p, energy: p.energy - n }));
    return true;
  };

  const refillEnergy = () =>
    setProfile((p) => ({ ...p, energy: p.maxEnergy }));

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
      return { ...p, trophies, league: leagueFor(trophies) };
    });

  const unlockMap = (id: string) =>
    setProfile((p) =>
      p.unlockedMaps.includes(id)
        ? p
        : { ...p, unlockedMaps: [...p.unlockedMaps, id] },
    );

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

  const advanceCampaign = () =>
    setProfile((p) => ({
      ...p,
      campaignProgress: p.campaignProgress + 1,
    }));

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
        addTrophies,
        unlockMap,
        buySkin,
        selectSkin,
        advanceCampaign,
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
