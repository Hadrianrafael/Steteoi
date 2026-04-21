import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

type Quest = {
  id: string;
  label: string;
  goal: number;
  reward: { coins?: number; gems?: number };
  icon: keyof typeof FontAwesome5.glyphMap;
};

const QUESTS: Quest[] = [
  { id: "win3", label: "Vença 3 partidas", goal: 3, reward: { coins: 500 }, icon: "trophy" },
  { id: "conquer", label: "Conquiste 20 territórios", goal: 20, reward: { gems: 15 }, icon: "flag" },
  { id: "plane", label: "Envie 10 aviões", goal: 10, reward: { coins: 300, gems: 5 }, icon: "plane" },
];

const EVENTS = [
  {
    id: "ev1",
    name: "Operação Tempestade",
    desc: "Anúncios premiados rendem o dobro",
    color: game.gold,
    icon: "bolt" as const,
    duration: 1000 * 60 * 60 * 23,
  },
  {
    id: "ev2",
    name: "Guerra Mundial",
    desc: "Conquiste 5 capitais para 200 gemas",
    color: game.danger,
    icon: "fire" as const,
    duration: 1000 * 60 * 60 * 47,
  },
  {
    id: "ev3",
    name: "Frota Lendária",
    desc: "-50% no upgrade do Drone Hipersônico",
    color: game.gem,
    icon: "rocket" as const,
    duration: 1000 * 60 * 60 * 6,
  },
];

function formatTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

export default function EventsScreen() {
  const { profile, addCoins, addGems } = useGame();
  const [now, setNow] = useState(Date.now());
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const claim = (q: Quest) => {
    if (claimed[q.id]) return;
    if (q.reward.coins) addCoins(q.reward.coins);
    if (q.reward.gems) addGems(q.reward.gems);
    setClaimed((c) => ({ ...c, [q.id]: true }));
    Alert.alert("Recompensa coletada!", q.label);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>EVENTOS AO VIVO</Text>
        <Text style={styles.heroTitle}>Promoções por tempo limitado</Text>
      </View>

      {EVENTS.map((e) => (
        <View
          key={e.id}
          style={[styles.eventCard, { borderColor: e.color + "55" }]}
        >
          <LinearGradient
            colors={[e.color + "22", "transparent"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.iconBox, { backgroundColor: e.color + "33" }]}>
            <FontAwesome5 name={e.icon} size={26} color={e.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventName}>{e.name}</Text>
            <Text style={styles.eventDesc}>{e.desc}</Text>
            <View style={styles.timerRow}>
              <FontAwesome5 name="clock" size={10} color={game.gold} />
              <Text style={styles.timerText}>
                Termina em {formatTime(e.duration - (now % e.duration))}
              </Text>
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>MISSÕES DIÁRIAS</Text>

      {QUESTS.map((q) => {
        const progress =
          q.id === "win3"
            ? Math.min(q.goal, profile.totalWins)
            : q.id === "plane"
              ? Math.min(q.goal, profile.totalWins * 3)
              : Math.min(q.goal, profile.totalWins * 7);
        const ready = progress >= q.goal && !claimed[q.id];
        return (
          <View key={q.id} style={styles.questCard}>
            <View style={[styles.iconBox, { backgroundColor: game.gold + "22" }]}>
              <FontAwesome5 name={q.icon} size={20} color={game.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.questLabel}>{q.label}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(progress / q.goal) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{q.goal}
              </Text>
            </View>
            <Pressable
              disabled={!ready}
              onPress={() => claim(q)}
              style={[
                styles.claimBtn,
                {
                  backgroundColor: claimed[q.id]
                    ? game.surfaceElevated
                    : ready
                      ? game.gold
                      : game.surfaceElevated,
                  opacity: ready || claimed[q.id] ? 1 : 0.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.claimText,
                  {
                    color:
                      claimed[q.id] || !ready ? game.muted : game.bgDeep,
                  },
                ]}
              >
                {claimed[q.id] ? "OK" : ready ? "RESGATAR" : "BLOQUEADO"}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  hero: {
    padding: 16,
    backgroundColor: game.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: game.border,
    gap: 4,
  },
  heroEyebrow: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  heroTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  eventName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  eventDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  timerText: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  sectionTitle: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 4,
  },
  questCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
  },
  questLabel: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: game.bgDeep,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: game.gold,
  },
  progressText: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: 4,
  },
  claimBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  claimText: {
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 0.8,
  },
});
