import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
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

const ENEMY_COLORS = ["#3FD0FF", "#FFB300", "#8A4FFF", "#2ECC71", "#FF3DBE"];

export default function Lobby() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, consumeEnergy, enemyCountForLevel } = useGame();
  const btnScale = useRef(new Animated.Value(1)).current;

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

  const animateBtn = (toValue: number) =>
    Animated.spring(btnScale, { toValue, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Cinematic top gradient */}
      <LinearGradient
        colors={[game.purple + "20", "transparent"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="chevron-left" size={20} color={game.text} />
        </Pressable>
        <Text style={styles.headerTitle}>NOVA PARTIDA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Match card ─────────────────────────── */}
        <View style={styles.matchCard}>
          <LinearGradient
            colors={[game.purple + "44", game.bgDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.matchEye}>BATALHA SELECIONADA</Text>
          <Text style={styles.matchTitle}>1 <Text style={styles.matchVs}>VS</Text> {enemies}</Text>
          <Text style={styles.matchMode}>
            {profile.level <= 5
              ? "Iniciante · Bots fáceis"
              : profile.level <= 10
                ? "Intermediário · Bots equilibrados"
                : "Avançado · Bots elite"}
          </Text>
          <View style={styles.tagRow}>
            <Tag icon="trophy" color={game.gold}   label={`+${trophyReward} troféus`} />
            <Tag icon="bolt"   color={game.energy} label="1 energia" />
            <Tag icon="puzzle-piece" color={game.gem} label="+1 figurinha" />
          </View>
        </View>

        {/* ── Players ─────────────────────────────── */}
        <Text style={styles.section}>JOGADORES</Text>
        <View style={styles.card}>
          {/* Player row */}
          <View style={styles.playerRow}>
            <LinearGradient colors={[game.primary, game.primaryDark]} style={styles.avatar}>
              <FontAwesome5 name="crown" size={16} color={game.text} />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.playerName}>{profile.name}</Text>
              <Text style={styles.playerSub}>Você · NV {profile.level}</Text>
            </View>
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>VOCÊ</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Enemy rows */}
          {Array.from({ length: enemies }).map((_, i) => (
            <View key={i} style={[styles.playerRow, i < enemies - 1 && { marginBottom: 6 }]}>
              <View style={[styles.avatar, { backgroundColor: ENEMY_COLORS[i % ENEMY_COLORS.length] }]}>
                <FontAwesome5 name="robot" size={14} color="#000" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.playerName}>BOT_{(i + 1).toString().padStart(2, "0")}</Text>
                <Text style={styles.playerSub}>Inimigo</Text>
              </View>
              <View style={[styles.enemyDot, { backgroundColor: ENEMY_COLORS[i % ENEMY_COLORS.length] }]} />
            </View>
          ))}
        </View>

        {/* ── Loadout ─────────────────────────────── */}
        <Text style={styles.section}>SEU EXÉRCITO</Text>
        <View style={[styles.card, styles.loadout]}>
          <LoadStat icon="paper-plane" color={game.gem}    label="Avião"     value={`NV ${profile.planeLevels[String(profile.planeTier)] ?? 1}`} />
          <LoadStat icon="bomb"        color={game.danger}  label="Bombas"    value={String(profile.skillNuke)} />
          <LoadStat icon="shield-alt"  color={game.gem}     label="Escudos"   value={String(profile.skillShield)} />
          <LoadStat icon="snowflake"   color="#7FD8FF"      label="Congelar"  value={String(profile.skillFreeze)} />
        </View>

        {/* ── Start button ─────────────────────────── */}
        <Animated.View style={[styles.startWrap, { transform: [{ scale: btnScale }] }]}>
          <Pressable
            onPress={handleStart}
            onPressIn={() => animateBtn(0.97)}
            onPressOut={() => animateBtn(1)}
            disabled={profile.energy < 1}
            style={{ opacity: profile.energy < 1 ? 0.4 : 1 }}
          >
            <LinearGradient
              colors={[game.gold, "#FF8E2E", game.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.startInner}
            >
              <FontAwesome5 name="crosshairs" size={22} color={game.text} />
              <Text style={styles.startTxt}>INICIAR BATALHA</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {profile.energy < 1 && (
          <Text style={styles.noEnergy}>
            Sem energia. Volte ao menu para assistir um vídeo.
          </Text>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function Tag({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <View style={styles.tag}>
      <FontAwesome5 name={icon as never} size={10} color={color} />
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

function LoadStat({ icon, color, label, value }: { icon: string; color: string; label: string; value: string }) {
  return (
    <View style={styles.loadCol}>
      <View style={[styles.loadIcon, { backgroundColor: color + "22" }]}>
        <FontAwesome5 name={icon as never} size={18} color={color} />
      </View>
      <Text style={styles.loadValue}>{value}</Text>
      <Text style={styles.loadLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bgDeep },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: game.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: game.surface, borderWidth: 1, borderColor: game.border,
  },
  headerTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 15,
    letterSpacing: 2,
  },
  scroll: { padding: 14, gap: 12 },

  matchCard: {
    borderRadius: 22,
    padding: 18,
    gap: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: game.purple + "44",
  },
  matchEye: {
    color: game.purple,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 2,
  },
  matchTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 44,
    letterSpacing: 2,
    lineHeight: 50,
  },
  matchVs: {
    color: game.primary,
    fontSize: 28,
  },
  matchMode: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: game.bgDeep,
    borderWidth: 1,
    borderColor: game.border,
  },
  tagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },

  section: {
    color: game.muted,
    fontFamily: "Inter_900Black",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: game.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: game.border,
    gap: 8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
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
  enemyDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: game.border,
    marginVertical: 2,
  },

  loadout: { flexDirection: "row" },
  loadCol: { flex: 1, alignItems: "center", gap: 5 },
  loadIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  loadValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  loadLabel: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },

  startWrap: {
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: game.primary,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 14,
  },
  startInner: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  startTxt: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
    letterSpacing: 2,
  },
  noEnergy: {
    color: game.danger,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
