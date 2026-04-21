import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
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
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { game } from "@/constants/colors";
import {
  MAX_TROOPS,
  Owner,
  PLAYER_COLORS,
  PLAYER_NAMES,
  TROOP_INTERVAL_MS,
  aiMove,
  attack,
  checkWinner,
  createGame,
  tickTroops,
  type GameState,
} from "@/lib/gameEngine";
import { getMap } from "@/lib/maps";

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    mapId?: string;
    mode?: string;
    players?: string;
  }>();
  const { width } = useWindowDimensions();

  const map = useMemo(() => getMap(params.mapId ?? "usa"), [params.mapId]);
  const numPlayers = Math.max(
    2,
    Math.min(5, parseInt(params.players ?? "2", 10) || 2),
  );

  const [state, setState] = useState<GameState>(() =>
    createGame(map, numPlayers),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const pulse = useRef(new Animated.Value(0)).current;

  // Pulse animation for selected territory
  useEffect(() => {
    if (selected) {
      Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      pulse.setValue(0);
      pulse.stopAnimation();
    }
  }, [selected, pulse]);

  // Troop generation tick
  useEffect(() => {
    if (paused || state.finished) return;
    const t = setInterval(() => {
      setState((s) => tickTroops(s));
    }, TROOP_INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, state.finished]);

  // AI tick - each AI acts on staggered intervals
  useEffect(() => {
    if (paused || state.finished) return;
    const intervals: ReturnType<typeof setInterval>[] = [];
    state.players
      .filter((p) => p !== "player")
      .forEach((ai, idx) => {
        const interval = setInterval(
          () => {
            setState((s) => {
              if (s.finished) return s;
              return aiMove(s, ai);
            });
          },
          2200 + idx * 600 + Math.random() * 400,
        );
        intervals.push(interval);
      });
    return () => intervals.forEach(clearInterval);
  }, [paused, state.finished, state.players]);

  // Win check
  useEffect(() => {
    if (state.finished) return;
    const w = checkWinner(state);
    if (w) {
      setState((s) => ({ ...s, finished: true, winner: w }));
      setTimeout(() => {
        router.replace(
          `/result?winner=${w}&mapId=${map.id}` as never,
        );
      }, 700);
    }
  }, [state, map.id, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  };

  const onTapTerritory = (id: string) => {
    if (state.finished) return;
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
    const result = attack(state, selected, id);
    if (!result.success) {
      showToast(result.message);
      // Try changing selection if tapped own territory
      if (ts.owner === "player" && ts.troops >= 2) {
        setSelected(id);
      }
      return;
    }
    setState(result.state);
    setSelected(null);
    showToast(result.message);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  };

  // Compute territory counts per owner
  const counts = useMemo(() => {
    const c: Partial<Record<Owner, number>> = {};
    for (const id in state.states) {
      const o = state.states[id]!.owner;
      c[o] = (c[o] ?? 0) + 1;
    }
    return c;
  }, [state]);

  const svgWidth = Math.min(width - 24, 520);
  const svgHeight = (svgWidth * map.height) / map.width;

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
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
          <Text style={styles.mapTitle}>{map.name}</Text>
          <Text style={styles.mapMeta}>
            {Object.keys(state.players).length} jogadores
          </Text>
        </View>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.back()}
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
        <LinearGradient
          colors={[game.surfaceElevated, game.bgDeep]}
          style={styles.mapBg}
        >
          <Svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${map.width} ${map.height}`}
          >
            <Defs>
              <RadialGradient id="bgglow" cx="50%" cy="50%" r="60%">
                <Stop offset="0%" stopColor={game.purple} stopOpacity="0.25" />
                <Stop offset="100%" stopColor={game.bg} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={map.width / 2}
              cy={map.height / 2}
              r={map.width / 2}
              fill="url(#bgglow)"
            />
            {/* Adjacency lines */}
            {map.territories.map((t) =>
              t.adj.map((adjId) => {
                const o = map.territories.find((x) => x.id === adjId);
                if (!o || adjId < t.id) return null;
                const isAttackable =
                  selected === t.id || selected === adjId;
                return (
                  <Line
                    key={`${t.id}-${adjId}`}
                    x1={t.x}
                    y1={t.y}
                    x2={o.x}
                    y2={o.y}
                    stroke={isAttackable ? game.gold : game.border}
                    strokeWidth={isAttackable ? 1.6 : 1}
                    strokeDasharray={isAttackable ? undefined : "3,3"}
                    opacity={isAttackable ? 1 : 0.6}
                  />
                );
              }),
            )}
            {/* Territories */}
            {map.territories.map((t) => {
              const ts = state.states[t.id]!;
              const color = PLAYER_COLORS[ts.owner];
              const isSelected = selected === t.id;
              const fromTerr = selected
                ? map.territories.find((x) => x.id === selected)
                : null;
              const isTarget =
                fromTerr != null &&
                fromTerr.adj.includes(t.id) &&
                t.id !== selected;
              return (
                <G key={t.id}>
                  {isSelected && (
                    <Circle
                      cx={t.x}
                      cy={t.y}
                      r={14}
                      fill="none"
                      stroke={game.gold}
                      strokeWidth={2}
                      opacity={0.9}
                    />
                  )}
                  <Circle
                    cx={t.x}
                    cy={t.y}
                    r={11}
                    fill={color}
                    stroke={isTarget ? game.gold : game.text}
                    strokeWidth={isTarget ? 2 : 1.2}
                    opacity={ts.owner === "neutral" ? 0.7 : 1}
                  />
                  <SvgText
                    x={t.x}
                    y={t.y + 3.6}
                    fill={ts.owner === "neutral" ? game.textDim : game.text}
                    fontSize={10}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {ts.troops}
                  </SvgText>
                </G>
              );
            })}
          </Svg>

          {/* Touch overlay (positioned absolutely above SVG) */}
          <View style={[styles.touchLayer, { width: svgWidth, height: svgHeight }]}>
            {map.territories.map((t) => {
              const cx = (t.x / map.width) * svgWidth;
              const cy = (t.y / map.height) * svgHeight;
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
                    borderRadius: r,
                  }}
                />
              );
            })}
            {/* Selected pulse animation overlay */}
            {selected &&
              (() => {
                const t = map.territories.find((x) => x.id === selected)!;
                const cx = (t.x / map.width) * svgWidth;
                const cy = (t.y / map.height) * svgHeight;
                return (
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: cx - 22,
                      top: cy - 22,
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      borderWidth: 2,
                      borderColor: game.gold,
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    }}
                  />
                );
              })()}
          </View>
        </LinearGradient>
      </View>

      {/* Hint */}
      <View style={styles.hintBox}>
        {selected ? (
          <Text style={styles.hint}>
            Toque em um território adjacente para atacar/reforçar
          </Text>
        ) : (
          <Text style={styles.hint}>
            Toque em um território seu (vermelho) para selecionar
          </Text>
        )}
        <View style={styles.legend}>
          <FontAwesome5 name="shield-alt" size={11} color={game.gold} />
          <Text style={styles.legendText}>
            Tropas crescem +1 a cada {(TROOP_INTERVAL_MS / 1000).toFixed(1)}s
            (max {MAX_TROOPS})
          </Text>
        </View>
      </View>

      {toast && (
        <View style={[styles.toast, { bottom: 24 + insets.bottom }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {paused && !state.finished && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseTitle}>PAUSADO</Text>
          <Pressable style={styles.pauseBtn} onPress={() => setPaused(false)}>
            <Feather name="play" size={28} color={game.text} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  headerCenter: { alignItems: "center" },
  mapTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  mapMeta: {
    color: game.textDim,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: game.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  playersBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    marginTop: 6,
    justifyContent: "center",
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
  },
  playerDot: { width: 8, height: 8, borderRadius: 4 },
  playerChipText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  playerChipCount: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  mapWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  mapBg: {
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: game.border,
    margin: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  touchLayer: {
    position: "absolute",
    left: 12,
    top: 12,
  },
  hintBox: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  hint: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
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
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: game.bgDeep + "DD",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  pauseTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 28,
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
});
