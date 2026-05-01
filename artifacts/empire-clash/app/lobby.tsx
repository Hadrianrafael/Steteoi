import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
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
import { showInterstitialAd } from "@/lib/admob";

export default function Lobby() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, consumeEnergy, enemyCountForLevel } = useGame();

  const enemies = enemyCountForLevel();
  const totalPlayers = enemies + 1;
  const trophyReward = 15 + enemies * 8;

  const handleStart = () => {
    if (!consumeEnergy(1)) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    showInterstitialAd({
      onClosed: () => router.push(`/game?players=${totalPlayers}&diff=normal` as never),
    });
  };

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
          <Text style={styles.previewTitle}>1 vs {enemies}</Text>
          <Text style={styles.previewSub}>
            {profile.level <= 5
              ? "Modo Iniciante · Bots fáceis"
              : profile.level <= 10
                ? "Modo Intermediário · Bots equilibrados"
                : "Modo Avançado · Bots elite"}
          </Text>
          <View style={styles.previewRow}>
            <View style={styles.previewTag}>
              <FontAwesome5 name="trophy" size={11} color={game.gold} />
              <Text style={styles.previewTagText}>+{trophyReward} troféus</Text>
            </View>
            <View style={styles.previewTag}>
              <FontAwesome5 name="bolt" size={11} color={game.energy} />
              <Text style={styles.previewTagText}>1 energia</Text>
            </View>
            <View style={styles.previewTag}>
              <FontAwesome5 name="puzzle-piece" size={11} color={game.gem} />
              <Text style={styles.previewTagText}>+1 figurinha</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Players visual */}
        <Text style={styles.section}>JOGADORES</Text>
        <View style={styles.playersBox}>
          <View style={styles.playerRow}>
            <View style={[styles.avatarLg, { backgroundColor: game.danger }]}>
              <FontAwesome5 name="crown" size={18} color={game.text} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.playerName}>{profile.name}</Text>
              <Text style={styles.playerSub}>Você · NV {profile.level}</Text>
            </View>
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>VOCÊ</Text>
            </View>
          </View>
          {Array.from({ length: enemies }).map((_, i) => {
            const colors = ["#3FD0FF", "#FFB300", "#8A4FFF", "#2ECC71", "#FF3DBE"];
            return (
              <View key={i} style={styles.playerRow}>
                <View
                  style={[styles.avatarLg, { backgroundColor: colors[i] }]}
                >
                  <FontAwesome5 name="robot" size={16} color={game.text} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.playerName}>BOT_{(i + 1).toString().padStart(2, "0")}</Text>
                  <Text style={styles.playerSub}>Inimigo</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Loadout */}
        <Text style={styles.section}>SEU EXÉRCITO</Text>
        <View style={styles.loadout}>
          <View style={styles.loadCol}>
            <FontAwesome5 name="paper-plane" size={20} color={game.gem} />
            <Text style={styles.loadValue}>NV {profile.planeLevels[String(profile.planeTier)] ?? 1}</Text>
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
            Sem energia. Volte ao menu para assistir um vídeo.
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
    fontSize: 36,
    letterSpacing: 2,
  },
  previewSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  previewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  playersBox: {
    backgroundColor: game.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: game.border,
    gap: 8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  avatarLg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  playerName: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
  playerSub: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
  },
  youBadge: {
    backgroundColor: game.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  youBadgeText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 10,
    letterSpacing: 1,
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
