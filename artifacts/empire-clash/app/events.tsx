import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

const MISSIONS = [
  { id: "m1", title: "Vença 3 batalhas", goal: 3, reward: 200, icon: "crown" as const },
  { id: "m2", title: "Conquiste 10 territórios", goal: 10, reward: 150, icon: "flag" as const },
  { id: "m3", title: "Jogue 5 partidas ranqueadas", goal: 5, reward: 50, icon: "medal" as const, gems: true },
];

const EVENTS = [
  {
    id: "blitz",
    title: "Blitz de Sábado",
    desc: "Recompensas em dobro nas batalhas 1v1 neste fim de semana",
    color: game.primary,
    icon: "bolt" as const,
    days: 2,
  },
  {
    id: "world",
    title: "Conquista Global",
    desc: "Desbloqueie o mapa Mundo participando do torneio",
    color: game.gem,
    icon: "globe" as const,
    days: 5,
  },
  {
    id: "season",
    title: "Passe Temporada 1",
    desc: "30 níveis de recompensas exclusivas",
    color: game.gold,
    icon: "crown" as const,
    days: 22,
  },
];

function useCountdown(days: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date();
  target.setDate(target.getDate() + days);
  target.setHours(23, 59, 59);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}

export default function EventsScreen() {
  const router = useRouter();
  const { addCoins, addGems } = useGame();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: 40 }}
    >
      <Text style={styles.section}>EVENTOS ATIVOS</Text>
      <View style={{ gap: 10 }}>
        {EVENTS.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </View>

      <Text style={styles.section}>MISSÕES DIÁRIAS</Text>
      <View style={{ gap: 10 }}>
        {MISSIONS.map((m, idx) => {
          const progress = Math.min(m.goal, idx + 1);
          const done = progress >= m.goal;
          return (
            <View key={m.id} style={styles.missionCard}>
              <View style={styles.missionIcon}>
                <FontAwesome5 name={m.icon} size={18} color={game.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.missionTitle}>{m.title}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(progress / m.goal) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.missionMeta}>
                  {progress}/{m.goal}
                </Text>
              </View>
              <Pressable
                disabled={!done}
                onPress={() => {
                  if (m.gems) addGems(m.reward);
                  else addCoins(m.reward);
                }}
                style={[
                  styles.claimBtn,
                  { opacity: done ? 1 : 0.4 },
                ]}
              >
                <FontAwesome5
                  name={m.gems ? "gem" : "coins"}
                  size={11}
                  color={m.gems ? game.gem : game.gold}
                />
                <Text style={styles.claimText}>{m.reward}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable
        style={styles.cta}
        onPress={() => router.push("/play" as never)}
      >
        <LinearGradient
          colors={[game.gold, game.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaInner}
        >
          <FontAwesome5 name="crown" size={20} color={game.bgDeep} />
          <Text style={styles.ctaText}>BATALHAR PARA PROGREDIR</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

function EventCard({ event }: { event: (typeof EVENTS)[number] }) {
  const time = useCountdown(event.days);
  return (
    <View style={[styles.eventCard, { borderColor: event.color + "55" }]}>
      <LinearGradient
        colors={[event.color + "22", "transparent"]}
        style={styles.eventGradient}
      />
      <View style={[styles.eventIcon, { backgroundColor: event.color + "33" }]}>
        <FontAwesome5 name={event.icon} size={22} color={event.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDesc}>{event.desc}</Text>
        <View style={styles.timeRow}>
          <FontAwesome5 name="clock" size={10} color={game.textDim} />
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  section: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
    overflow: "hidden",
  },
  eventGradient: { ...StyleSheet.absoluteFillObject },
  eventIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitle: {
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
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  timeText: {
    color: game.textDim,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: game.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: game.gold + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  missionTitle: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  missionMeta: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  progressBar: {
    height: 5,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: game.gold,
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: game.bgDeep,
  },
  claimText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  cta: {
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaInner: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 15,
    letterSpacing: 1.4,
  },
});
