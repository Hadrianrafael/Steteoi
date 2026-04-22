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

  // Layout
  const mapAreaH = height - insets.top - insets.bottom - 200;
  const svgWidth = Math.min(width - 16, 720);
  const svgHeight = Math.min(mapAreaH, (svgWidth * map.height) / map.width);
  const scaleX = svgWidth / map.width;
  const scaleY = svgHeight / map.height;

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
          addExplosion(t.x * scaleX, t.y * scaleY);
        }
        return out.state;
      });
    },
    [addExplosion, scaleX, scaleY, shieldActive],
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
        const cx = t.x * scaleX;
        const cy = t.y * scaleY;
        const d = Math.hypot(cx - lx, cy - ly);
        if (d < bestDist) {
          bestDist = d;
          nearest = t.id;
        }
      }
      return nearest;
    },
    [map.territories, scaleX, scaleY],
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
            x1: t.x * scaleX,
            y1: t.y * scaleY,
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
            x1: t.x * scaleX,
            y1: t.y * scaleY,
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
    [findTerritoryAt, map.territories, paused, performAttack, scaleX, scaleY, state.finished],
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
          addExplosion(tt.x * scaleX, tt.y * scaleY);
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
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
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
        </View>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.replace("/")}
          hitSlop={10}
        >
          <Feather name="x" size={20} color={game.text} />
        </Pressable>
      </View>

      {/* Players bar */}
      <View style={styles.playersBar}>
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
              <View
                style={[styles.playerDot, { backgroundColor: PLAYER_COLORS[p] }]}
              />
              <Text style={styles.playerChipText}>{PLAYER_NAMES[p]}</Text>
              <Text style={styles.playerChipCount}>{c}</Text>
            </View>
          );
        })}
      </View>

      {/* Map */}
      <View style={styles.mapWrap}>
        <Animated.View
          style={[
            styles.mapBg,
            {
              width: svgWidth + 24,
              height: svgHeight + 24,
              backgroundColor: waterFill,
            },
          ]}
        >
          <Svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${map.width} ${map.height}`}
          >
            <Defs>
              <RadialGradient id="bgglow" cx="50%" cy="50%" r="60%">
                <Stop offset="0%" stopColor={game.purple} stopOpacity="0.18" />
                <Stop offset="100%" stopColor={game.bg} stopOpacity="0" />
              </RadialGradient>
              <SvgLinearGradient id="continent" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#2D3D6E" stopOpacity="0.55" />
                <Stop offset="100%" stopColor="#1A244A" stopOpacity="0.55" />
              </SvgLinearGradient>
            </Defs>

            {/* Continent silhouettes (decorative) */}
            <Path
              d="M70,60 Q120,40 170,75 Q200,110 175,170 Q150,230 195,300 Q160,330 130,290 Q90,250 80,180 Q60,120 70,60 Z"
              fill="url(#continent)"
            />
            <Path
              d="M300,55 Q400,40 470,80 Q540,75 580,120 Q620,150 600,200 Q570,180 530,200 Q480,180 440,200 Q380,180 340,200 Q300,170 290,120 Q280,80 300,55 Z"
              fill="url(#continent)"
            />
            <Path
              d="M340,200 Q420,210 430,260 Q420,310 390,320 Q350,310 340,260 Q330,220 340,200 Z"
              fill="url(#continent)"
            />
            <Path
              d="M580,260 Q640,260 660,295 Q650,330 600,320 Q570,300 580,260 Z"
              fill="url(#continent)"
            />
            <Circle cx={map.width / 2} cy={map.height / 2} r={map.width / 2.2} fill="url(#bgglow)" />

            {/* Adjacency lines */}
            {map.territories.map((t) =>
              t.adj.map((adjId) => {
                const o = map.territories.find((x) => x.id === adjId);
                if (!o || adjId < t.id) return null;
                return (
                  <Line
                    key={`${t.id}-${adjId}`}
                    x1={t.x}
                    y1={t.y}
                    x2={o.x}
                    y2={o.y}
                    stroke={game.border}
                    strokeWidth={0.8}
                    strokeDasharray="2,3"
                    opacity={0.5}
                  />
                );
              }),
            )}

            {/* Territory base circles (color = owner) */}
            {map.territories.map((t) => {
              const ts = state.states[t.id]!;
              const color = PLAYER_COLORS[ts.owner];
              const isSelected = selected === t.id;
              const fromT = selected ? map.territories.find((x) => x.id === selected) : null;
              const isTarget = fromT != null && t.id !== selected;
              const dist = fromT ? distance(fromT, t) : 0;
              const targetIsPlane = fromT && dist > ADJACENT_DIST;
              return (
                <G key={t.id}>
                  {isSelected && (
                    <Circle
                      cx={t.x}
                      cy={t.y}
                      r={20}
                      fill="none"
                      stroke={game.gold}
                      strokeWidth={1.5}
                      strokeDasharray="3,3"
                      opacity={0.9}
                    />
                  )}
                  <Circle
                    cx={t.x}
                    cy={t.y}
                    r={t.isIsland ? 13 : 16}
                    fill={color}
                    stroke={
                      isTarget ? (targetIsPlane ? game.gem : game.gold) : game.text
                    }
                    strokeWidth={isTarget ? 1.5 : 1}
                    opacity={ts.owner === "neutral" ? 0.65 : 0.95}
                  />
                  {t.isIsland && (
                    <Circle
                      cx={t.x}
                      cy={t.y}
                      r={17}
                      fill="none"
                      stroke={game.gem}
                      strokeWidth={0.8}
                      strokeDasharray="2,2"
                      opacity={0.7}
                    />
                  )}
                </G>
              );
            })}
          </Svg>

          {/* Touch + flag overlay */}
          <View
            {...panResponder.panHandlers}
            style={[styles.touchLayer, { width: svgWidth, height: svgHeight }]}
          >
            {map.territories.map((t) => {
              const ts = state.states[t.id]!;
              const cx = t.x * scaleX;
              const cy = t.y * scaleY;
              const r = 22;
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
                  <Text style={styles.flagText}>{t.flag}</Text>
                  <View style={styles.troopBadge}>
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
                  fromX={fromT.x * scaleX}
                  fromY={fromT.y * scaleY}
                  toX={toT.x * scaleX}
                  toY={toT.y * scaleY}
                  duration={f.duration}
                  color={PLAYER_COLORS[f.owner]}
                  troops={f.sending}
                  onDone={() => resolveFlight(f)}
                />
              );
            })}

            {/* Explosions */}
            {explosions.map((e) => (
              <Explosion key={e.id} x={e.x} y={e.y} />
            ))}

            {/* Drag line overlay */}
            {dragLine && (
              <Svg
                pointerEvents="none"
                width={svgWidth}
                height={svgHeight}
                style={StyleSheet.absoluteFillObject}
              >
                <Line
                  x1={dragLine.x1}
                  y1={dragLine.y1}
                  x2={dragLine.x2}
                  y2={dragLine.y2}
                  stroke={game.gold}
                  strokeWidth={2.5}
                  strokeDasharray="6,4"
                  opacity={0.95}
                />
                <Circle
                  cx={dragLine.x2}
                  cy={dragLine.y2}
                  r={10}
                  fill="none"
                  stroke={game.gold}
                  strokeWidth={2}
                />
              </Svg>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Skill bar (scrollable) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.skillBar}
      >
        <SkillButton
          icon="bomb"
          label="BOMBA"
          color={game.danger}
          count={profile.skillNuke}
          onPress={triggerNuke}
        />
        <SkillButton
          icon="users"
          label="REFORÇO"
          color={game.success}
          count={profile.skillRally}
          onPress={triggerRally}
        />
        <SkillButton
          icon="shield-alt"
          label="ESCUDO"
          color={game.gem}
          count={profile.skillShield}
          onPress={triggerShield}
          disabled={shieldActive}
        />
        <SkillButton
          icon="fire"
          label="FÚRIA"
          color={"#FF6A1A"}
          count={profile.skillFury}
          onPress={triggerFury}
          disabled={furyActive}
        />
        <SkillButton
          icon="snowflake"
          label="CONGELAR"
          color={"#7FD8FF"}
          count={profile.skillFreeze}
          onPress={triggerFreeze}
          disabled={freezeActive}
        />
        <SkillButton
          icon="user-secret"
          label="ESPIÃO"
          color={game.purple}
          count={profile.skillSpy}
          onPress={triggerSpy}
          disabled={spyActive}
        />
      </ScrollView>

      {toast && (
        <View style={[styles.toast, { bottom: 130 + insets.bottom }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {paused && !state.finished && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseTitle}>PAUSADO</Text>
          <Pressable style={styles.pauseBtn} onPress={() => setPaused(false)}>
            <Feather name="play" size={28} color={game.text} />
          </Pressable>
          <Pressable
            style={styles.exitBtn}
            onPress={() => router.replace("/")}
          >
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
  root: { flex: 1, backgroundColor: game.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: game.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  playersBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    paddingHorizontal: 10,
    marginTop: 4,
    justifyContent: "center",
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: game.surface,
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
  mapWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  mapBg: {
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: game.border,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  touchLayer: {
    position: "absolute",
    left: 12,
    top: 12,
  },
  flagText: {
    fontSize: 18,
    textAlign: "center",
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
    backgroundColor: game.surface,
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
