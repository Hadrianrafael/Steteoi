import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";
import {
  MISSION_DEFS,
  MissionType,
  useGame,
} from "@/contexts/GameContext";

const TAB_LABELS: { key: MissionType; label: string }[] = [
  { key: "daily", label: "Diárias" },
  { key: "weekly", label: "Semanais" },
  { key: "monthly", label: "Mensais" },
];

const COLOR_MAP: Record<MissionType, string> = {
  daily: game.gold,
  weekly: game.gem,
  monthly: game.primary,
};

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const { getMissions, claimMission } = useGame();
  const [tab, setTab] = useState<MissionType>("daily");

  const missions = getMissions(tab);
  const accent = COLOR_MAP[tab];

  const handleClaim = (id: string) => {
    const ok = claimMission(id);
    if (ok) {
      const def = MISSION_DEFS.find((m) => m.id === id);
      if (!def) return;
      const parts: string[] = [];
      if (def.reward.coins) parts.push(`+${def.reward.coins} moedas`);
      if (def.reward.gems) parts.push(`+${def.reward.gems} gemas`);
      if (def.reward.cards) parts.push(`+${def.reward.cards} carta(s)`);
      Alert.alert("Recompensa resgatada!", parts.join("\n"));
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[game.bgDeep, game.bg]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <FontAwesome5 name="tasks" size={22} color={game.gold} />
        <Text style={styles.title}>MISSÕES</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TAB_LABELS.map(({ key, label }) => {
          const active = tab === key;
          const col = COLOR_MAP[key];
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[
                styles.tab,
                active && { backgroundColor: col + "33", borderColor: col },
              ]}
            >
              <Text style={[styles.tabText, active && { color: col }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {missions.map((m) => {
          const pct = Math.min(1, m.progress / m.goal);
          const canClaim = !m.claimed && m.progress >= m.goal;
          return (
            <View
              key={m.id}
              style={[
                styles.card,
                m.claimed && { opacity: 0.55 },
                canClaim && { borderColor: accent + "AA" },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{m.title}</Text>
                  <Text style={styles.cardDesc}>{m.description}</Text>
                </View>
                <Pressable
                  onPress={() => handleClaim(m.id)}
                  disabled={!canClaim}
                  style={({ pressed }) => [
                    styles.claimBtn,
                    {
                      backgroundColor: m.claimed
                        ? game.muted + "55"
                        : canClaim
                          ? accent
                          : game.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.claimText,
                      { color: canClaim ? game.bgDeep : game.muted },
                    ]}
                  >
                    {m.claimed ? "OK" : canClaim ? "RESGATAR" : "..."}
                  </Text>
                </Pressable>
              </View>

              {/* Progress bar */}
              <View style={styles.progBg}>
                <LinearGradient
                  colors={[accent, accent + "AA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progFill, { width: `${pct * 100}%` }]}
                />
              </View>
              <Text style={styles.progText}>
                {m.progress}/{m.goal}
              </Text>

              {/* Rewards preview */}
              <View style={styles.rewardRow}>
                {m.reward.coins ? (
                  <View style={styles.rewardChip}>
                    <FontAwesome5 name="coins" size={11} color={game.gold} />
                    <Text style={[styles.rewardChipText, { color: game.gold }]}>
                      {m.reward.coins}
                    </Text>
                  </View>
                ) : null}
                {m.reward.gems ? (
                  <View style={styles.rewardChip}>
                    <FontAwesome5 name="gem" size={11} color={game.gem} />
                    <Text style={[styles.rewardChipText, { color: game.gem }]}>
                      {m.reward.gems}
                    </Text>
                  </View>
                ) : null}
                {m.reward.cards ? (
                  <View style={styles.rewardChip}>
                    <FontAwesome5
                      name="layer-group"
                      size={11}
                      color="#A78BFA"
                    />
                    <Text
                      style={[styles.rewardChipText, { color: "#A78BFA" }]}
                    >
                      {m.reward.cards} carta
                      {m.reward.cards > 1 ? "s" : ""}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    letterSpacing: 3,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: game.border,
    alignItems: "center",
  },
  tabText: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: game.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: game.border,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  cardDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  claimBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  claimText: {
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  progBg: {
    height: 8,
    backgroundColor: game.bgDeep,
    borderRadius: 4,
    overflow: "hidden",
  },
  progFill: {
    height: "100%",
    borderRadius: 4,
  },
  progText: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    alignSelf: "flex-end",
  },
  rewardRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  rewardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: game.bgDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rewardChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
