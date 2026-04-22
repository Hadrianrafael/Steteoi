import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

type Mode = { id: number; label: string; subtitle: string; reward: number };

const MODES: Mode[] = [
  { id: 2, label: "1 vs 1", subtitle: "Duelo rápido", reward: 15 },
  { id: 3, label: "1 vs 2", subtitle: "Trio padrão", reward: 22 },
  { id: 4, label: "1 vs 3", subtitle: "Recomendado", reward: 32 },
  { id: 5, label: "1 vs 4", subtitle: "Caos total — máximo de troféus", reward: 50 },
];

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTIES: { id: Difficulty; label: string; mult: number; color: string }[] = [
  { id: "easy", label: "FÁCIL", mult: 0.7, color: game.success },
  { id: "normal", label: "NORMAL", mult: 1, color: game.gem },
  { id: "hard", label: "DIFÍCIL", mult: 1.5, color: game.danger },
];

export default function Lobby() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, consumeEnergy } = useGame();
  const [mode, setMode] = useState<Mode>(MODES[2]!);
  const [diff, setDiff] = useState<Difficulty>("normal");

  const handleStart = () => {
    if (!consumeEnergy(1)) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    router.push(`/game?players=${mode.id}&diff=${diff}` as never);
  };

  const trophyReward = Math.round(
    mode.reward * (DIFFICULTIES.find((d) => d.id === diff)?.mult ?? 1),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Feather name="chevron-left" size={22} color={game.text} />
        </Pressable>
        <Text style={styles.headerTitle}>NOVA PARTIDA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Match preview */}
        <LinearGradient
          colors={[game.purple + "55", game.surface]}
          style={styles.preview}
        >
          <Text style={styles.previewEyebrow}>BATALHA SELECIONADA</Text>
          <Text style={styles.previewTitle}>{mode.label}</Text>
          <Text style={styles.previewSub}>{mode.subtitle}</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewTag}>
              <FontAwesome5 name="trophy" size={11} color={game.gold} />
              <Text style={styles.previewTagText}>+{trophyReward} troféus</Text>
            </View>
            <View style={styles.previewTag}>
              <FontAwesome5 name="bolt" size={11} color={game.energy} />
              <Text style={styles.previewTagText}>1 energia</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Players */}
        <Text style={styles.section}>QUANTOS INIMIGOS?</Text>
        <View style={styles.modeGrid}>
          {MODES.map((m) => {
            const sel = m.id === mode.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMode(m)}
                style={[styles.modeCard, sel && styles.modeCardSel]}
              >
                <View style={styles.modeAvatars}>
                  <View style={[styles.avatar, { backgroundColor: game.danger }]}>
                    <Text style={styles.avatarTxt}>1</Text>
                  </View>
                  <Text style={styles.modeVs}>VS</Text>
                  <View style={styles.modeEnemyStack}>
                    {Array.from({ length: m.id - 1 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.enemyDot,
                          {
                            backgroundColor: ["#3FD0FF", "#FFB300", "#8A4FFF", "#2ECC71"][i],
                            marginLeft: i === 0 ? 0 : -8,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <Text style={[styles.modeLabel, sel && { color: game.gold }]}>
                  {m.label}
                </Text>
                <Text style={styles.modeSub}>{m.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Difficulty */}
        <Text style={styles.section}>DIFICULDADE</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => {
            const sel = d.id === diff;
            return (
              <Pressable
                key={d.id}
                onPress={() => setDiff(d.id)}
                style={[
                  styles.diffCard,
                  sel && { borderColor: d.color, backgroundColor: d.color + "22" },
                ]}
              >
                <FontAwesome5
                  name={
                    d.id === "easy"
                      ? "leaf"
                      : d.id === "normal"
                        ? "fist-raised"
                        : "skull"
                  }
                  size={18}
                  color={sel ? d.color : game.muted}
                />
                <Text style={[styles.diffLabel, sel && { color: d.color }]}>
                  {d.label}
                </Text>
                <Text style={styles.diffMult}>×{d.mult}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Loadout summary */}
        <Text style={styles.section}>SEU EXÉRCITO</Text>
        <View style={styles.loadout}>
          <View style={styles.loadCol}>
            <FontAwesome5 name="paper-plane" size={20} color={game.gem} />
            <Text style={styles.loadValue}>Tier {profile.planeTier}</Text>
            <Text style={styles.loadLabel}>Avião</Text>
          </View>
          <View style={styles.loadCol}>
            <FontAwesome5 name="bomb" size={20} color={game.danger} />
            <Text style={styles.loadValue}>{profile.skillNuke}</Text>
            <Text style={styles.loadLabel}>Bombas</Text>
          </View>
          <View style={styles.loadCol}>
            <FontAwesome5 name="shield-alt" size={20} color={game.gem} />
            <Text style={styles.loadValue}>{profile.skillShield}</Text>
            <Text style={styles.loadLabel}>Escudos</Text>
          </View>
          <View style={styles.loadCol}>
            <FontAwesome5 name="snowflake" size={20} color={"#7FD8FF"} />
            <Text style={styles.loadValue}>{profile.skillFreeze}</Text>
            <Text style={styles.loadLabel}>Congelar</Text>
          </View>
        </View>

        <Pressable
          onPress={handleStart}
          disabled={profile.energy < 1}
          style={({ pressed }) => [
            styles.startBtn,
            { opacity: profile.energy < 1 ? 0.4 : pressed ? 0.85 : 1 },
          ]}
        >
          <LinearGradient
            colors={[game.gold, "#FF8E2E", game.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startInner}
          >
            <FontAwesome5 name="crosshairs" size={20} color={game.text} />
            <Text style={styles.startTxt}>INICIAR BATALHA</Text>
          </LinearGradient>
        </Pressable>

        {profile.energy < 1 && (
          <Text style={styles.noEnergy}>
            Sem energia. Aguarde recarga ou compre na loja.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: game.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
  },
  headerTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 16,
    letterSpacing: 2,
  },
  scroll: { padding: 14, gap: 14, paddingBottom: 40 },
  preview: {
    padding: 16,
    borderRadius: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: game.purple + "55",
  },
  previewEyebrow: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 2,
  },
  previewTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 32,
    letterSpacing: 2,
  },
  previewSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  previewRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  previewTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: game.bgDeep + "AA",
  },
  previewTagText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  section: {
    color: game.textDim,
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 6,
  },
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modeCard: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 2,
    borderColor: game.border,
    gap: 8,
  },
  modeCardSel: {
    borderColor: game.gold,
    backgroundColor: game.gold + "15",
  },
  modeAvatars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 12,
  },
  modeVs: {
    color: game.muted,
    fontFamily: "Inter_900Black",
    fontSize: 10,
  },
  modeEnemyStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  enemyDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: game.surface,
  },
  modeLabel: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
    letterSpacing: 1,
  },
  modeSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  diffRow: {
    flexDirection: "row",
    gap: 8,
  },
  diffCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    borderColor: game.border,
    alignItems: "center",
    gap: 4,
  },
  diffLabel: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  diffMult: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  loadout: {
    flexDirection: "row",
    backgroundColor: game.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  loadCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  loadValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
  loadLabel: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  startBtn: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: game.primary,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  startInner: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  startTxt: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 17,
    letterSpacing: 2,
  },
  noEnergy: {
    color: game.danger,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
});
