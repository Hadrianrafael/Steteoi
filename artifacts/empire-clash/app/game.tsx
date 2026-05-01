import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { Plane } from "@/components/Plane";
import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import {
  MAX_TROOPS,
  Owner,
  PLAYER_COLORS,
  PLAYER_NAMES,
  TROOP_INTERVAL_MS,
  chooseAiAction,
  checkWinner,
  createGame,
  resolveAttack,
  tickTroops,
  type GameState,
} from "@/lib/gameEngine";
import { ADJACENT_DIST, distance, getMap } from "@/lib/maps";

type Flight = {
  id: string;
  fromId: string;
  toId: string;
  sending: number;
  owner: Owner;
  attackBonus: number;
  duration: number;
};

const PLANE_BASE_DURATION = 1300;

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ players?: string; diff?: string }>();
  const { width, height } = useWindowDimensions();
  const { profile, useSkill } = useGame();

  const numPlayers = Math.max(2, Math.min(5, Number(params.players) || 4));
  const difficulty = (params.diff as "easy" | "normal" | "hard") || "normal";
  const aiSpeedMult =
    difficulty === "easy" ? 1.5 : difficulty === "hard" ? 0.65 : 1;
  const aiAttackBonus =
    difficulty === "easy" ? -0.05 : difficulty === "hard" ? 0.08 : 0;

  const map = useMemo(() => getMap(), []);

  const [state, setState] = useState<GameState>(() => {
    const s = createGame(map, numPlayers);
    // Apply starting troops upgrade for player
    const bonus = profile.upgStart;
    if (bonus > 0) {
      const newStates = { ...s.states };
      for (const id in newStates) {
        if (newStates[id]!.owner === "player") {
          newStates[id] = {
            ...newStates[id]!,
            troops: newStates[id]!.troops + bonus,
          };
        }
      }
      return { ...s, states: newStates };
    }
    return s;
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [shieldActive, setShieldActive] = useState(false);
  const [furyActive, setFuryActive] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [spyActive, setSpyActive] = useState(false);
  const [explosions, setExplosions] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const [dragLine, setDragLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const dragOriginRef = useRef<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Layout — full screen with slice scaling
  const svgWidth = width;
  const svgHeight = height;
  // "slice" transform: scale so viewBox covers the full screen
  const sliceScale = Math.max(svgWidth / map.width, svgHeight / map.height);
  const sliceTx = (svgWidth - map.width * sliceScale) / 2;
  const sliceTy = (svgHeight - map.height * sliceScale) / 2;
  // legacy aliases used throughout (now uniform scale)
  const scaleX = sliceScale;
  const scaleY = sliceScale;

  // Water animation
  const water = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(water, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(water, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();
  }, [water]);

  // Troop generation
  useEffect(() => {
    if (paused || state.finished) return;
    const t = setInterval(() => {
      setState((s) => tickTroops(s, profile.upgGrowth * 0.2));
    }, TROOP_INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, state.finished, profile.upgGrowth]);

  // AI ticks
  useEffect(() => {
    if (paused || state.finished) return;
    const intervals: ReturnType<typeof setInterval>[] = [];
    state.players
      .filter((p) => p !== "player")
      .forEach((ai, idx) => {
        const interval = setInterval(
          () => {
            const s = stateRef.current;
            if (s.finished) return;
            if (freezeActive) return;
            const action = chooseAiAction(s, ai);
            if (!action) return;
            launchAttack(
              action.fromId,
              action.toId,
              action.sending,
              ai,
              aiAttackBonus,
              action.isPlane,
            );
          },
          (2400 + idx * 800) * aiSpeedMult,
        );
        intervals.push(interval);
      });
    return () => intervals.forEach(clearInterval);
  }, [paused, state.finished, state.players, freezeActive, aiSpeedMult, aiAttackBonus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Win check
  useEffect(() => {
    if (state.finished) return;
    const w = checkWinner(state);
    if (w) {
      setState((s) => ({ ...s, finished: true, winner: w }));
      setTimeout(() => {
        router.replace(`/result?winner=${w}` as never);
      }, 700);
    }
  }, [state, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1300);
  };

  const addExplosion = useCallback((x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setExplosions((arr) => [...arr, { id, x, y }]);
    setTimeout(() => {
      setExplosions((arr) => arr.filter((e) => e.id !== id));
    }, 700);
  }, []);

  const applyAttack = useCallback(
    (
      fromId: string,
      toId: string,
      sending: number,
      owner: Owner,
      attackBonus: number,
      restoreSending: boolean,
    ) => {
      setState((s) => {
        const fromState = s.states[fromId];
        if (!fromState || fromState.owner !== owner) return s;
        const toState = s.states[toId];
        if (!toState) return s;
        // For plane flights we pre-deducted troops; restore them so resolveAttack can deduct cleanly
        const baseState = restoreSending
          ? {
              ...s,
              states: {
                ...s.states,
                [fromId]: {
                  ...fromState,
                  troops: Math.min(MAX_TROOPS, fromState.troops + sending),
                },
              },
            }
          : s;
        let bonus = attackBonus;
        if (toState.owner === "player" && shieldActive && owner !== "player") {
          bonus -= 0.15;
        }
        const actualSending = Math.min(
          sending,
          baseState.states[fromId]!.troops - 1,
        );
        if (actualSending < 1) return baseState;
        const out = resolveAttack(baseState, fromId, toId, actualSending, bonus);
        if (out.conquered) {
          const t = s.map.territories.find((x) => x.id === toId)!;
          addExplosion(t.x * sliceScale + sliceTx, t.y * sliceScale + sliceTy);
        }
        return out.state;
      });
    },
    [addExplosion, sliceScale, sliceTx, sliceTy, shieldActive],
  );

  const resolveFlight = useCallback(
    (flight: Flight) => {
      applyAttack(
        flight.fromId,
        flight.toId,
        flight.sending,
        flight.owner,
        flight.attackBonus,
        true,
      );
      setFlights((f) => f.filter((x) => x.id !== flight.id));
    },
    [applyAttack],
  );

  const launchAttack = useCallback(
    (
      fromId: string,
      toId: string,
      sending: number,
      owner: Owner,
      attackBonus: number,
      isPlane: boolean,
    ) => {
      const s = stateRef.current;
      const fromState = s.states[fromId];
      if (!fromState || fromState.owner !== owner || fromState.troops < 2) return;
      const actualSending = Math.min(sending, fromState.troops - 1);
      if (actualSending < 1) return;

      if (!isPlane) {
        applyAttack(fromId, toId, actualSending, owner, attackBonus, false);
        return;
      }

      // Plane: pre-deduct troops so they "leave" the source visually
      setState((cur) => {
        const cs = cur.states[fromId];
        if (!cs || cs.owner !== owner) return cur;
        return {
          ...cur,
          states: {
            ...cur.states,
            [fromId]: {
              ...cs,
              troops: Math.max(0, cs.troops - actualSending),
            },
          },
        };
      });

      const planeSpeedMs = Math.max(
        500,
        PLANE_BASE_DURATION -
          profile.upgPlaneSpeed * 100 -
          (profile.planeTier - 1) * 250,
      );

      const flight: Flight = {
        id: `${Date.now()}-${Math.random()}`,
        fromId,
        toId,
        sending: actualSending,
        owner,
        attackBonus,
        duration: planeSpeedMs,
      };
      setFlights((f) => [...f, flight]);
    },
    [applyAttack, profile.planeTier, profile.upgPlaneSpeed],
  );

  const performAttack = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      const cur = stateRef.current;
      const fromState = cur.states[fromId];
      if (!fromState || fromState.owner !== "player") return;
      if (fromState.troops < 2) {
        showToast("Tropas insuficientes");
        return;
      }
      const fromT = map.territories.find((t) => t.id === fromId)!;
      const toT = map.territories.find((t) => t.id === toId)!;
      const sending = Math.floor(fromState.troops * 0.7);
      const isPlane = distance(fromT, toT) > ADJACENT_DIST;
      const attackBonus = profile.upgAttack * 0.03 + (furyActive ? 0.3 : 0);
      launchAttack(fromId, toId, sending, "player", attackBonus, isPlane);
      showToast(isPlane ? `Avião enviado: ${sending}` : `Ataque: ${sending}`);
    },
    [furyActive, launchAttack, map.territories, profile.upgAttack],
  );

  const findTerritoryAt = useCallback(
    (lx: number, ly: number) => {
      // lx, ly are coords inside touchLayer (svgWidth x svgHeight)
      let nearest: string | null = null;
      let bestDist = 32; // touch radius in screen px
      for (const t of map.territories) {
        const cx = t.x * sliceScale + sliceTx;
        const cy = t.y * sliceScale + sliceTy;
        const d = Math.hypot(cx - lx, cy - ly);
        if (d < bestDist) {
          bestDist = d;
          nearest = t.id;
        }
      }
      return nearest;
    },
    [map.territories, sliceScale, sliceTx, sliceTy],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !paused && !state.finished,
        onMoveShouldSetPanResponder: (_, g) =>
          !paused &&
          !state.finished &&
          (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4),
        onPanResponderGrant: (e) => {
          const lx = e.nativeEvent.locationX;
          const ly = e.nativeEvent.locationY;
          const id = findTerritoryAt(lx, ly);
          if (!id) return;
          const ts = stateRef.current.states[id];
          if (!ts || ts.owner !== "player" || ts.troops < 2) return;
          dragOriginRef.current = id;
          setSelected(id);
          const t = map.territories.find((x) => x.id === id)!;
          setDragLine({
            x1: t.x * sliceScale + sliceTx,
            y1: t.y * sliceScale + sliceTy,
            x2: lx,
            y2: ly,
          });
        },
        onPanResponderMove: (e) => {
          if (!dragOriginRef.current) return;
          const lx = e.nativeEvent.locationX;
          const ly = e.nativeEvent.locationY;
          const t = map.territories.find(
            (x) => x.id === dragOriginRef.current,
          )!;
          setDragLine({
            x1: t.x * sliceScale + sliceTx,
            y1: t.y * sliceScale + sliceTy,
            x2: lx,
            y2: ly,
          });
        },
        onPanResponderRelease: (e) => {
          const origin = dragOriginRef.current;
          dragOriginRef.current = null;
          setDragLine(null);
          if (!origin) return;
          const lx = e.nativeEvent.locationX;
          const ly = e.nativeEvent.locationY;
          const target = findTerritoryAt(lx, ly);
          setSelected(null);
          if (!target || target === origin) return;
          performAttack(origin, target);
        },
        onPanResponderTerminate: () => {
          dragOriginRef.current = null;
          setDragLine(null);
        },
      }),
    [findTerritoryAt, map.territories, paused, performAttack, sliceScale, sliceTx, sliceTy, state.finished],
  );

  const onTapTerritory = (id: string) => {
    if (state.finished || paused) return;
    const ts = state.states[id]!;
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    if (selected === null) {
      if (ts.owner !== "player") {
        showToast("Selecione um território seu");
        return;
      }
      if (ts.troops < 2) {
        showToast("Tropas insuficientes");
        return;
      }
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const fromT = map.territories.find((t) => t.id === selected)!;
    const toT = map.territories.find((t) => t.id === id)!;
    const fromState = state.states[selected]!;
    if (fromState.troops < 2) {
      showToast("Sem tropas");
      setSelected(null);
      return;
    }
    const sending = Math.floor(fromState.troops * 0.7);
    const isPlane = distance(fromT, toT) > ADJACENT_DIST;
    const attackBonus = profile.upgAttack * 0.03 + (furyActive ? 0.3 : 0);

    launchAttack(selected, id, sending, "player", attackBonus, isPlane);
    setSelected(null);
    showToast(isPlane ? `Avião enviado: ${sending}` : `Ataque: ${sending}`);
  };

  // Skill buttons
  const triggerNuke = () => {
    if (!useSkill("skillNuke")) {
      showToast("Sem cargas de bomba");
      return;
    }
    // Reduce all enemy territories by half
    setState((s) => {
      const newStates = { ...s.states };
      for (const id in newStates) {
        const t = newStates[id]!;
        if (t.owner !== "player" && t.owner !== "neutral") {
          newStates[id] = {
            ...t,
            troops: Math.max(1, Math.floor(t.troops / 2)),
          };
          const tt = s.map.territories.find((x) => x.id === id)!;
          addExplosion(tt.x * sliceScale + sliceTx, tt.y * sliceScale + sliceTy);
        }
      }
      return { ...s, states: newStates };
    });
    showToast("BOMBA ATIVADA!");
  };

  const triggerRally = () => {
    if (!useSkill("skillRally")) {
      showToast("Sem cargas de reforço");
      return;
    }
    setState((s) => {
      const newStates = { ...s.states };
      for (const id in newStates) {
        const t = newStates[id]!;
        if (t.owner === "player") {
          newStates[id] = {
            ...t,
            troops: Math.min(MAX_TROOPS, t.troops + 5),
          };
        }
      }
      return { ...s, states: newStates };
    });
    showToast("Reforços +5!");
  };

  const triggerShield = () => {
    if (!useSkill("skillShield")) {
      showToast("Sem escudos");
      return;
    }
    setShieldActive(true);
    showToast("Escudo ativo (8s)");
    setTimeout(() => setShieldActive(false), 8000);
  };

  const triggerFury = () => {
    if (!useSkill("skillFury")) {
      showToast("Sem cargas de fúria");
      return;
    }
    setFuryActive(true);
    showToast("FÚRIA! +30% ataque (10s)");
    setTimeout(() => setFuryActive(false), 10000);
  };

  const triggerFreeze = () => {
    if (!useSkill("skillFreeze")) {
      showToast("Sem cargas de congelar");
      return;
    }
    setFreezeActive(true);
    showToast("INIMIGOS CONGELADOS! (5s)");
    setTimeout(() => setFreezeActive(false), 5000);
  };

  const triggerSpy = () => {
    if (!useSkill("skillSpy")) {
      showToast("Sem cargas de espião");
      return;
    }
    setSpyActive(true);
    showToast("ESPIÃO ATIVO (10s)");
    setTimeout(() => setSpyActive(false), 10000);
  };

  // Counts per owner
  const counts = useMemo(() => {
    const c: Partial<Record<Owner, number>> = {};
    for (const id in state.states) {
      const o = state.states[id]!.owner;
      c[o] = (c[o] ?? 0) + 1;
    }
    return c;
  }, [state]);

  const waterFill = water.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0F1F4A", "#13256A"],
  });

  return (
    <View style={styles.root}>

      {/* ── FULL-SCREEN MAP ─────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: waterFill }]}>
        <Svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${map.width} ${map.height}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            {/* Ocean gradient */}
            <SvgLinearGradient id="ocean" x1="0%" y1="0%" x2="30%" y2="100%">
              <Stop offset="0%" stopColor="#0A1A45" />
              <Stop offset="55%" stopColor="#0D2260" />
              <Stop offset="100%" stopColor="#0A3070" />
            </SvgLinearGradient>
            {/* Land gradients */}
            <SvgLinearGradient id="land1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#2E7D32" />
              <Stop offset="100%" stopColor="#1B5E20" />
            </SvgLinearGradient>
            <SvgLinearGradient id="land2" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#388E3C" />
              <Stop offset="100%" stopColor="#1B5E20" />
            </SvgLinearGradient>
            <SvgLinearGradient id="land3" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#43A047" />
              <Stop offset="100%" stopColor="#2E7D32" />
            </SvgLinearGradient>
            <SvgLinearGradient id="land4" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor="#33691E" />
              <Stop offset="100%" stopColor="#1B5E20" />
            </SvgLinearGradient>
            <SvgLinearGradient id="land5" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#558B2F" />
              <Stop offset="100%" stopColor="#2E7D32" />
            </SvgLinearGradient>
            {/* Shore glow */}
            <RadialGradient id="shore1" cx="50%" cy="50%" r="50%">
              <Stop offset="60%" stopColor="#1565C0" stopOpacity="0" />
              <Stop offset="100%" stopColor="#42A5F5" stopOpacity="0.18" />
            </RadialGradient>
            {/* Glow for selected territory */}
            <RadialGradient id="selglow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFD600" stopOpacity="0.55" />
              <Stop offset="100%" stopColor="#FFD600" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Ocean base */}
          <Rect x={0} y={0} width={map.width} height={map.height} fill="url(#ocean)" />

          {/* Wave bands (portrait 360×720) */}
          <Path
            d="M0,160 Q45,150 90,160 Q135,170 180,160 Q225,150 270,160 Q315,170 360,160 L360,175 Q315,185 270,175 Q225,165 180,175 Q135,185 90,175 Q45,165 0,175 Z"
            fill="#1565C0" opacity="0.13"
          />
          <Path
            d="M0,360 Q45,350 90,360 Q135,370 180,360 Q225,350 270,360 Q315,370 360,360 L360,375 Q315,385 270,375 Q225,365 180,375 Q135,385 90,375 Q45,365 0,375 Z"
            fill="#1565C0" opacity="0.11"
          />
          <Path
            d="M0,560 Q45,550 90,560 Q135,570 180,560 Q225,550 270,560 Q315,570 360,560 L360,572 Q315,582 270,572 Q225,562 180,572 Q135,582 90,572 Q45,562 0,572 Z"
            fill="#1565C0" opacity="0.09"
          />

          {/* ── CONTINENTS (portrait 360×720) ──────────────── */}

          {/* North America (us at 85,215) */}
          <Path d="M22,105 C52,72 108,78 135,100 C158,120 160,152 148,178 C136,204 118,225 98,235 C76,244 50,238 30,222 C8,204 2,172 4,142 C6,114 14,110 22,105 Z" fill="url(#land1)" />
          <Path d="M22,105 C52,72 108,78 135,100 C158,120 160,152 148,178 C136,204 118,225 98,235 C76,244 50,238 30,222 C8,204 2,172 4,142 C6,114 14,110 22,105 Z" fill="none" stroke="#4CAF50" strokeWidth="2" opacity="0.6" />
          {/* Alaska bump */}
          <Path d="M4,138 C-8,128 -16,138 -14,155 C-12,168 0,175 12,168 C18,158 8,145 4,138 Z" fill="url(#land1)" />
          {/* Greenland */}
          <Path d="M118,48 C136,30 162,34 172,55 C180,72 172,98 152,106 C132,112 114,98 108,80 C103,64 108,55 118,48 Z" fill="url(#land1)" opacity="0.85" />
          {/* Central America isthmus */}
          <Path d="M98,235 C102,252 106,270 102,282 C92,286 84,282 82,270 C80,258 88,245 98,235 Z" fill="url(#land2)" />
          {/* Caribbean */}
          <Path d="M78,210 C86,204 96,207 98,218 C99,226 90,232 82,228 C74,224 72,215 78,210 Z" fill="url(#land3)" />

          {/* South America (br at 100,440) */}
          <Path d="M60,330 C85,310 125,312 148,336 C168,356 172,390 166,422 C158,458 140,490 115,505 C90,518 62,510 45,490 C26,468 22,435 30,403 C38,370 50,345 60,330 Z" fill="url(#land2)" />
          <Path d="M60,330 C85,310 125,312 148,336 C168,356 172,390 166,422 C158,458 140,490 115,505 C90,518 62,510 45,490 C26,468 22,435 30,403 C38,370 50,345 60,330 Z" fill="none" stroke="#66BB6A" strokeWidth="2" opacity="0.55" />

          {/* Europe (uk at 210,135; fr at 230,195) */}
          <Path d="M172,100 C202,80 248,82 270,108 C288,128 288,160 272,185 C256,210 228,222 202,218 C175,213 155,196 148,172 C140,146 146,110 172,100 Z" fill="url(#land3)" />
          <Path d="M172,100 C202,80 248,82 270,108 C288,128 288,160 272,185 C256,210 228,222 202,218 C175,213 155,196 148,172 C140,146 146,110 172,100 Z" fill="none" stroke="#81C784" strokeWidth="2" opacity="0.55" />
          {/* Iberian bump */}
          <Path d="M150,172 C144,185 140,205 150,218 C162,226 176,218 178,205 C180,192 170,178 150,172 Z" fill="url(#land3)" />
          {/* Scandinavia */}
          <Path d="M222,65 C232,45 255,40 268,55 C278,68 275,90 258,98 C240,105 220,95 218,78 C215,68 218,65 222,65 Z" fill="url(#land2)" />
          {/* UK island (at 210,135) */}
          <Path d="M192,108 C204,93 222,96 230,112 C236,126 228,144 215,150 C202,155 188,147 184,132 C180,118 184,110 192,108 Z" fill="url(#land3)" />
          {/* Ireland */}
          <Path d="M174,118 C182,108 196,110 198,122 C199,134 190,142 180,138 C170,134 168,125 174,118 Z" fill="url(#land3)" />

          {/* Russia/Eurasia (ru at 285,130) */}
          <Path d="M258,62 C292,40 345,44 360,72 C370,92 365,122 348,145 C330,168 302,178 275,175 C248,172 232,152 232,126 C232,100 240,75 258,62 Z" fill="url(#land1)" />
          <Path d="M258,62 C292,40 345,44 360,72 C365,92 365,122 348,145 C330,168 302,178 275,175 C248,172 232,152 232,126 C232,100 240,75 258,62 Z" fill="none" stroke="#66BB6A" strokeWidth="2" opacity="0.55" />

          {/* Africa (eg at 248,305; za at 235,465) */}
          <Path d="M195,258 C225,238 272,242 298,268 C320,292 324,330 316,368 C308,408 290,446 265,468 C238,490 205,494 180,478 C154,460 140,424 140,388 C140,350 148,310 195,258 Z" fill="url(#land4)" />
          <Path d="M195,258 C225,238 272,242 298,268 C320,292 324,330 316,368 C308,408 290,446 265,468 C238,490 205,494 180,478 C154,460 140,424 140,388 C140,350 148,310 195,258 Z" fill="none" stroke="#4CAF50" strokeWidth="2" opacity="0.5" />
          {/* Arabian peninsula */}
          <Path d="M295,268 C312,258 334,264 342,285 C350,305 344,330 326,340 C308,350 288,338 282,315 C275,292 280,274 295,268 Z" fill="url(#land5)" />
          {/* Madagascar */}
          <Path d="M288,410 C296,398 312,402 316,418 C320,434 308,448 296,444 C284,440 282,422 288,410 Z" fill="url(#land4)" />

          {/* India subcontinent (in at 293,330) */}
          <Path d="M262,278 C285,264 322,270 342,295 C358,318 358,355 344,380 C330,405 304,416 278,408 C252,400 235,375 236,348 C238,320 248,288 262,278 Z" fill="url(#land2)" />
          <Path d="M262,278 C285,264 322,270 342,295 C358,318 358,355 344,380 C330,405 304,416 278,408 C252,400 235,375 236,348 C238,320 248,288 262,278 Z" fill="none" stroke="#81C784" strokeWidth="1.5" opacity="0.5" />

          {/* China/East Asia (cn at 300,230) */}
          <Path d="M270,172 C298,155 340,160 358,188 C375,215 372,250 354,272 C335,295 305,305 278,298 C250,290 235,265 238,240 C240,215 248,185 270,172 Z" fill="url(#land3)" />
          <Path d="M270,172 C298,155 340,160 358,188 C375,215 372,250 354,272 C335,295 305,305 278,298 C250,290 235,265 238,240 C240,215 248,185 270,172 Z" fill="none" stroke="#81C784" strokeWidth="1.5" opacity="0.5" />
          {/* Southeast Asia peninsula */}
          <Path d="M342,272 C358,264 372,272 375,292 C378,312 365,330 348,334 C330,338 316,322 318,302 C320,285 330,277 342,272 Z" fill="url(#land3)" />

          {/* Japan (jp at 340,198) */}
          <Path d="M326,172 C336,158 355,162 362,178 C368,192 360,212 346,218 C332,224 318,215 316,200 C314,186 320,178 326,172 Z" fill="url(#land2)" />
          <Path d="M358,170 C365,160 376,164 378,176 C380,188 370,198 360,195 C350,192 348,180 358,170 Z" fill="url(#land2)" />

          {/* Australia (au at 320,535) */}
          <Path d="M285,498 C308,480 348,484 365,510 C380,535 375,570 354,585 C332,600 302,596 283,574 C265,552 266,516 285,498 Z" fill="url(#land5)" />
          <Path d="M285,498 C308,480 348,484 365,510 C380,535 375,570 354,585 C332,600 302,596 283,574 C265,552 266,516 285,498 Z" fill="none" stroke="#8BC34A" strokeWidth="1.5" opacity="0.5" />
          {/* New Zealand */}
          <Path d="M358,595 C366,583 380,588 382,602 C385,617 373,630 360,625 C348,620 348,606 358,595 Z" fill="url(#land5)" />

          {/* Shore glow overlay */}
          <Rect x={0} y={0} width={map.width} height={map.height} fill="url(#shore1)" />

          {/* ── ADJACENCY LINES ──────────────────────────── */}
          {map.territories.map((t) =>
            t.adj.map((adjId) => {
              const o = map.territories.find((x) => x.id === adjId);
              if (!o || adjId < t.id) return null;
              return (
                <Line
                  key={`${t.id}-${adjId}`}
                  x1={t.x} y1={t.y}
                  x2={o.x} y2={o.y}
                  stroke="#FFFFFF"
                  strokeWidth={0.9}
                  strokeDasharray="3,4"
                  opacity={0.28}
                />
              );
            }),
          )}

          {/* ── TERRITORY CIRCLES ────────────────────────── */}
          {map.territories.map((t) => {
            const ts = state.states[t.id]!;
            const color = PLAYER_COLORS[ts.owner];
            const isSelected = selected === t.id;
            const fromT = selected ? map.territories.find((x) => x.id === selected) : null;
            const isTarget = fromT != null && t.id !== selected;
            const dist = fromT ? distance(fromT, t) : 0;
            const targetIsPlane = fromT && dist > ADJACENT_DIST;
            const r = t.isIsland ? 11 : 14;
            return (
              <G key={t.id}>
                {isSelected && (
                  <Circle cx={t.x} cy={t.y} r={28} fill="url(#selglow)" />
                )}
                {isTarget && (
                  <Circle
                    cx={t.x} cy={t.y} r={r + 8}
                    fill="none"
                    stroke={targetIsPlane ? game.gem : game.gold}
                    strokeWidth={2} strokeDasharray="4,3" opacity={0.8}
                  />
                )}
                <Circle cx={t.x + 1.5} cy={t.y + 2} r={r + 1} fill="#000000" opacity={0.30} />
                <Circle
                  cx={t.x} cy={t.y} r={r + 2}
                  fill={color}
                  opacity={ts.owner === "neutral" ? 0.45 : 0.30}
                />
                <Circle
                  cx={t.x} cy={t.y} r={r}
                  fill={color}
                  stroke={isSelected ? game.gold : ts.owner === "neutral" ? "#FFFFFF55" : "#FFFFFFAA"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={ts.owner === "neutral" ? 0.72 : 0.98}
                />
                {t.isIsland && (
                  <Circle
                    cx={t.x} cy={t.y} r={r + 6}
                    fill="none" stroke="#42A5F5"
                    strokeWidth={0.8} strokeDasharray="2,3" opacity={0.55}
                  />
                )}
              </G>
            );
          })}
        </Svg>

        {/* Touch + territory overlay */}
        <View
          {...panResponder.panHandlers}
          style={StyleSheet.absoluteFillObject}
        >
          {map.territories.map((t) => {
            const ts = state.states[t.id]!;
            const cx = t.x * sliceScale + sliceTx;
            const cy = t.y * sliceScale + sliceTy;
            const r = 26;
            const ownerColor = PLAYER_COLORS[ts.owner];
            const isMine = ts.owner === "player";
            return (
              <Pressable
                key={t.id}
                onPress={() => onTapTerritory(t.id)}
                style={{
                  position: "absolute",
                  left: cx - r,
                  top: cy - r,
                  width: r * 2,
                  height: r * 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ts.owner !== "neutral" && (
                  <View
                    style={[
                      styles.ownerFlag,
                      {
                        backgroundColor: ownerColor,
                        borderColor: isMine ? game.gold : "#FFFFFF",
                        borderWidth: isMine ? 2 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.ownerFlagText}>
                      {isMine ? "👑" : "⚔"}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.troopBadge,
                    {
                      backgroundColor: ownerColor,
                      borderColor: ts.owner === "neutral" ? "#FFFFFF55" : "#FFFFFF",
                    },
                  ]}
                >
                  <Text style={styles.troopText}>{ts.troops}</Text>
                </View>
              </Pressable>
            );
          })}

          {/* Plane flights */}
          {flights.map((f) => {
            const fromT = map.territories.find((t) => t.id === f.fromId)!;
            const toT = map.territories.find((t) => t.id === f.toId)!;
            return (
              <Plane
                key={f.id}
                fromX={fromT.x * sliceScale + sliceTx}
                fromY={fromT.y * sliceScale + sliceTy}
                toX={toT.x * sliceScale + sliceTx}
                toY={toT.y * sliceScale + sliceTy}
                duration={f.duration}
                color={PLAYER_COLORS[f.owner]}
                troops={f.sending}
                onDone={() => resolveFlight(f)}
              />
            );
          })}

          {explosions.map((e) => (
            <Explosion key={e.id} x={e.x} y={e.y} />
          ))}

          {dragLine && (
            <Svg
              pointerEvents="none"
              width={svgWidth}
              height={svgHeight}
              style={StyleSheet.absoluteFillObject}
            >
              <Line
                x1={dragLine.x1} y1={dragLine.y1}
                x2={dragLine.x2} y2={dragLine.y2}
                stroke={game.gold} strokeWidth={2.5} strokeDasharray="6,4" opacity={0.95}
              />
              <Circle
                cx={dragLine.x2} cy={dragLine.y2} r={10}
                fill="none" stroke={game.gold} strokeWidth={2}
              />
            </Svg>
          )}
        </View>
      </Animated.View>

      {/* ── FLOATING HEADER ──────────────────────────────────── */}
      <View style={[styles.header, { top: insets.top + 6 }]}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => setPaused((p) => !p)}
          hitSlop={10}
        >
          <Feather name={paused ? "play" : "pause"} size={18} color={game.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.mapTitle}>{map.name.toUpperCase()}</Text>
          {shieldActive && (
            <View style={styles.shieldTag}>
              <FontAwesome5 name="shield-alt" size={10} color={game.gem} />
              <Text style={styles.shieldText}>ESCUDO</Text>
            </View>
          )}
          {furyActive && (
            <View style={[styles.shieldTag, { backgroundColor: game.primary + "44" }]}>
              <FontAwesome5 name="fire" size={10} color={game.primary} />
              <Text style={[styles.shieldText, { color: game.primary }]}>FÚRIA</Text>
            </View>
          )}
          {freezeActive && (
            <View style={[styles.shieldTag, { backgroundColor: "#42A5F544" }]}>
              <FontAwesome5 name="snowflake" size={10} color="#42A5F5" />
              <Text style={[styles.shieldText, { color: "#42A5F5" }]}>FROZEN</Text>
            </View>
          )}
        </View>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.replace("/")}
          hitSlop={10}
        >
          <Feather name="x" size={20} color={game.text} />
        </Pressable>
      </View>

      {/* ── FLOATING PLAYERS BAR ─────────────────────────────── */}
      <View style={[styles.playersBar, { top: insets.top + 58 }]}>
        {state.players.map((p) => {
          const c = counts[p] ?? 0;
          const dead = c === 0;
          return (
            <View
              key={p}
              style={[
                styles.playerChip,
                dead && { opacity: 0.35 },
                p === "player" && { borderColor: PLAYER_COLORS[p] },
              ]}
            >
              <View style={[styles.playerDot, { backgroundColor: PLAYER_COLORS[p] }]} />
              <Text style={styles.playerChipText}>{PLAYER_NAMES[p]}</Text>
              <Text style={styles.playerChipCount}>{c}</Text>
            </View>
          );
        })}
      </View>

      {/* ── FLOATING SKILL BAR ───────────────────────────────── */}
      <View style={[styles.skillBarWrap, { bottom: insets.bottom + 8 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.skillBar}
        >
          <SkillButton icon="bomb" label="BOMBA" color={game.danger} count={profile.skillNuke} onPress={triggerNuke} />
          <SkillButton icon="users" label="REFORÇO" color={game.success} count={profile.skillRally} onPress={triggerRally} />
          <SkillButton icon="shield-alt" label="ESCUDO" color={game.gem} count={profile.skillShield} onPress={triggerShield} disabled={shieldActive} />
          <SkillButton icon="fire" label="FÚRIA" color={game.primary} count={profile.skillFury} onPress={triggerFury} disabled={furyActive} />
          <SkillButton icon="snowflake" label="CONGELAR" color="#42A5F5" count={profile.skillFreeze} onPress={triggerFreeze} disabled={freezeActive} />
          <SkillButton icon="user-secret" label="ESPIÃO" color={game.purple} count={profile.skillSpy} onPress={triggerSpy} disabled={spyActive} />
        </ScrollView>
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {paused && !state.finished && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseTitle}>PAUSADO</Text>
          <Pressable style={styles.pauseBtn} onPress={() => setPaused(false)}>
            <Feather name="play" size={28} color={game.text} />
          </Pressable>
          <Pressable style={styles.exitBtn} onPress={() => router.replace("/")}>
            <Text style={styles.exitText}>SAIR</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

}

function SkillButton({
  icon,
  label,
  color,
  count,
  onPress,
  disabled,
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  label: string;
  color: string;
  count: number;
  onPress: () => void;
  disabled?: boolean;
}) {
  const ready = count > 0 && !disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={!ready}
      style={({ pressed }) => [
        styles.skillBtn,
        {
          borderColor: ready ? color : game.border,
          opacity: ready ? (pressed ? 0.7 : 1) : 0.4,
        },
      ]}
    >
      <FontAwesome5 name={icon} size={20} color={ready ? color : game.muted} />
      <Text style={styles.skillLabel}>{label}</Text>
      <View style={[styles.skillCount, { backgroundColor: color }]}>
        <Text style={styles.skillCountText}>{count}</Text>
      </View>
    </Pressable>
  );
}

function Explosion({ x, y }: { x: number; y: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [t]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.4] });
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: game.gold + "AA",
        borderWidth: 2,
        borderColor: game.primary,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A1A45" },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#0A1A45CC",
  },
  headerCenter: { alignItems: "center", flexDirection: "row", gap: 8 },
  mapTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 14,
    letterSpacing: 2,
  },
  shieldTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: game.gem + "33",
  },
  shieldText: {
    color: game.gem,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A2E6E99",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF30",
  },
  playersBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: "center",
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#0D2260DD",
    borderWidth: 1,
    borderColor: game.border,
  },
  playerDot: { width: 6, height: 6, borderRadius: 3 },
  playerChipText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  playerChipCount: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },
  mapWrap: { flex: 1 },
  mapBg: { flex: 1 },
  touchLayer: { position: "absolute", left: 0, top: 0 },
  skillBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#0A1A45CC",
  },
  flagText: {
    fontSize: 18,
    textAlign: "center",
  },
  ownerFlag: {
    position: "absolute",
    top: -2,
    width: 24,
    height: 18,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerFlagText: {
    fontSize: 11,
  },
  troopBadge: {
    position: "absolute",
    bottom: -2,
    backgroundColor: game.bgDeep,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: game.border,
    minWidth: 18,
    alignItems: "center",
  },
  troopText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 10,
  },
  skillBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    paddingTop: 6,
    paddingBottom: 4,
  },
  skillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#0D2260EE",
    borderWidth: 1.5,
    minWidth: 130,
  },
  skillLabel: {
    flex: 1,
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  skillCount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  skillCountText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    bottom: "35%",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: game.gold,
    borderRadius: 12,
  },
  toastText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: game.bgDeep + "EE",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  pauseTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 32,
    letterSpacing: 4,
  },
  pauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: game.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  exitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: game.border,
    borderRadius: 12,
  },
  exitText: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
});
