import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "@/components/BottomNav";
import { JetSvg } from "@/components/jets/JetSvg";
import { TopBar } from "@/components/TopBar";
import { game } from "@/constants/colors";
import { useGame, xpProgress } from "@/contexts/GameContext";
import { showRewardedAd } from "@/lib/admob";
import { haptic } from "@/services/haptics";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    profile,
    claimDailyLogin,
    refillEnergy,
    multiplayerUnlocked,
    pendingOfflineReward,
    claimOfflineReward,
    touchActiveTs,
  } = useGame();

  const [reward, setReward] = useState<{ reward: number; type: "coins" | "gems" } | null>(null);
  const [energyAdLoading, setEnergyAdLoading] = useState(false);
  const [offlineModal, setOfflineModal] = useState(false);
  const [offlineDoubleLoading, setOfflineDoubleLoading] = useState(false);

  // Animations
  const jetFloat  = useRef(new Animated.Value(0)).current;
  const jetGlow   = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(1)).current;
  const btnGlow   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const r = claimDailyLogin();
    if (r) setReward(r);
    touchActiveTs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingOfflineReward) setOfflineModal(true);
  }, [pendingOfflineReward]);

  // Jet floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(jetFloat, { toValue: -10, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(jetFloat, { toValue:   0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(jetGlow, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(jetGlow, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, { toValue: 1.03, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(btnScale, { toValue: 1,    duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnGlow, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(btnGlow, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    ).start();
  }, [jetFloat, jetGlow, btnScale, btnGlow]);

  const handlePlay = () => {
    if (profile.energy < 1) return;
    haptic.play();
    router.push("/lobby");
  };

  const handleEnergyAd = () => {
    if (energyAdLoading) return;
    setEnergyAdLoading(true);
    showRewardedAd({
      onEarned: () => { refillEnergy(); setEnergyAdLoading(false); },
      onDismissed: () => setEnergyAdLoading(false),
    });
  };

  const handleOfflineClaim = (doubled: boolean) => {
    claimOfflineReward(doubled);
    setOfflineModal(false);
  };

  const handleOfflineDouble = () => {
    setOfflineDoubleLoading(true);
    showRewardedAd({
      onEarned:    () => { handleOfflineClaim(true);  setOfflineDoubleLoading(false); },
      onDismissed: () => { setOfflineDoubleLoading(false); },
    });
  };

  const xpFrac  = xpProgress(profile);
  const leagueColor =
    profile.league === "Diamante" ? game.gem
    : profile.league === "Ouro"   ? game.gold
    : profile.league === "Prata"  ? "#C0C8D8"
    : "#CD7F32";

  return (
    <View style={styles.root}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <TopBar />

      {/* ── Scrollable body ─────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile strip ──────────────────────────────────── */}
        <View style={styles.profileStrip}>
          <LinearGradient
            colors={[game.gold, game.primary]}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>{profile.level}</Text>
          </LinearGradient>

          <View style={styles.profileMid}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile.name}
              </Text>
              {profile.vipActive && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipText}>VIP</Text>
                </View>
              )}
            </View>

            <View style={styles.leagueRow}>
              <FontAwesome5 name="trophy" size={10} color={leagueColor} />
              <Text style={styles.leagueText}>{profile.league}</Text>
              <Text style={styles.trophyNum}>· {profile.trophies} 🏆</Text>
            </View>

            {/* XP bar */}
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.min(100, xpFrac * 100)}%` }]} />
            </View>
          </View>

          <Pressable
            onPress={() => { haptic.tap(); router.push("/settings"); }}
            style={styles.settingsBtn}
            hitSlop={10}
          >
            <Feather name="settings" size={17} color={game.muted} />
          </Pressable>
        </View>

        {/* ── Daily reward banner ────────────────────────────── */}
        {reward && (
          <View style={styles.rewardBanner}>
            <View style={styles.rewardIconWrap}>
              <FontAwesome5
                name={reward.type === "gems" ? "gem" : "coins"}
                size={16}
                color={reward.type === "gems" ? game.gem : game.gold}
              />
            </View>
            <View>
              <Text style={styles.rewardTitle}>Recompensa diária</Text>
              <Text style={styles.rewardValue}>
                +{reward.reward} {reward.type === "gems" ? "gemas" : "moedas"}
              </Text>
            </View>
            <Pressable onPress={() => setReward(null)} hitSlop={10} style={styles.rewardClose}>
              <Feather name="x" size={14} color={game.muted} />
            </Pressable>
          </View>
        )}

        {/* ── Hero section ────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Glow halo behind jet */}
          <Animated.View
            style={[
              styles.jetHalo,
              {
                opacity: jetGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] }),
                transform: [{ scale: jetGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
              },
            ]}
          />

          {/* Animated jet */}
          <Animated.View style={{ transform: [{ translateY: jetFloat }] }}>
            <JetSvg model="F22" color={game.gold} size={160} />
          </Animated.View>

          {/* Afterburner trails */}
          <Animated.View
            style={[
              styles.afterburner,
              { opacity: jetGlow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }) },
            ]}
          >
            <LinearGradient
              colors={["#FF6B00", "#FFB30000"]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={styles.afterburnerLeft}
            />
            <LinearGradient
              colors={["#FF6B00", "#FFB30000"]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={styles.afterburnerRight}
            />
          </Animated.View>

          {/* Game title */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleEyebrow}>JOGO DE ESTRATÉGIA</Text>
            <Text style={styles.titleMain}>EMPIRE CLASH</Text>
            <View style={styles.titleRule} />
          </View>
        </View>

        {/* ── JOGAR button ────────────────────────────────────── */}
        <View style={styles.playSection}>
          {profile.energy > 0 ? (
            <Animated.View
              style={[
                styles.playShadow,
                {
                  transform: [{ scale: btnScale }],
                  shadowOpacity: btnGlow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                  shadowRadius:  btnGlow.interpolate({ inputRange: [0, 1], outputRange: [14, 28] }),
                },
              ]}
            >
              <Pressable
                onPress={handlePlay}
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              >
                <LinearGradient
                  colors={["#FF8E00", game.primary, "#CC1C2E"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.playBtn}
                >
                  <FontAwesome5 name="crown" size={20} color="#fff" />
                  <Text style={styles.playLabel}>JOGAR</Text>
                  <View style={styles.energyCostTag}>
                    <FontAwesome5 name="bolt" size={10} color={game.energy} />
                    <Text style={styles.energyCostText}>−1</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ) : (
            /* Energy empty — show watch ad CTA */
            <Pressable
              onPress={handleEnergyAd}
              disabled={energyAdLoading}
              style={({ pressed }) => [
                styles.watchAdBtn,
                { opacity: energyAdLoading ? 0.65 : pressed ? 0.85 : 1 },
              ]}
            >
              <LinearGradient
                colors={[game.success + "CC", game.success]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.watchAdInner}
              >
                {energyAdLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <FontAwesome5 name="play-circle" size={18} color="#fff" />
                )}
                <Text style={styles.watchAdText}>
                  {energyAdLoading ? "Carregando anúncio…" : "ASSISTIR ANÚNCIO · RECUPERAR ENERGIA"}
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Multiplayer chip */}
          <Pressable
            onPress={() =>
              multiplayerUnlocked
                ? Alert.alert("Em breve", "Servidor multiplayer em manutenção. Volte em breve!")
                : Alert.alert("Bloqueado", `Alcance o nível 10 para jogar online. Nível atual: ${profile.level}.`)
            }
            style={({ pressed }) => [styles.mpChip, { opacity: pressed ? 0.75 : 1 }]}
          >
            <FontAwesome5
              name={multiplayerUnlocked ? "globe" : "lock"}
              size={12}
              color={multiplayerUnlocked ? game.gem : game.muted}
            />
            <Text style={[styles.mpChipText, { color: multiplayerUnlocked ? game.gem : game.muted }]}>
              {multiplayerUnlocked ? "MULTIPLAYER" : `MULTIPLAYER · NV 10`}
            </Text>
          </Pressable>
        </View>

        {/* ── Stats row ───────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { icon: "star",    color: game.gold,    label: "Nível",     value: String(profile.level)   },
            { icon: "trophy",  color: game.gold,    label: "Troféus",   value: String(profile.trophies) },
            { icon: "fire",    color: game.primary, label: "Vitórias",  value: `${profile.totalWins}` },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <FontAwesome5 name={s.icon as keyof typeof FontAwesome5.glyphMap} size={14} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* ── Bottom navigation ───────────────────────────────── */}
      <BottomNav />

      {/* ── Offline Reward Modal ────────────────────────────── */}
      <Modal
        visible={offlineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setOfflineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <FontAwesome5 name="gift" size={32} color={game.gold} />
            </View>
            <Text style={styles.modalTitle}>RECOMPENSA OFFLINE</Text>
            {pendingOfflineReward && (
              <>
                <Text style={styles.modalSub}>
                  Você ficou ausente por {pendingOfflineReward.hoursAway}h
                </Text>
                <View style={styles.modalRewards}>
                  <View style={styles.modalRewardChip}>
                    <FontAwesome5 name="coins" size={18} color={game.gold} />
                    <Text style={[styles.modalRewardVal, { color: game.gold }]}>
                      +{pendingOfflineReward.coins}
                    </Text>
                    <Text style={styles.modalRewardLabel}>moedas</Text>
                  </View>
                  {pendingOfflineReward.cards.length > 0 && (
                    <View style={styles.modalRewardChip}>
                      <FontAwesome5 name="layer-group" size={18} color="#A78BFA" />
                      <Text style={[styles.modalRewardVal, { color: "#A78BFA" }]}>
                        +{pendingOfflineReward.cards.length}
                      </Text>
                      <Text style={styles.modalRewardLabel}>carta(s)</Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={handleOfflineDouble}
                  disabled={offlineDoubleLoading}
                  style={({ pressed }) => [
                    styles.modalDoubleBtn,
                    { opacity: offlineDoubleLoading ? 0.65 : pressed ? 0.85 : 1 },
                  ]}
                >
                  <LinearGradient
                    colors={[game.gold, "#FF8E2E"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.modalDoubleBtnInner}
                  >
                    {offlineDoubleLoading ? (
                      <ActivityIndicator color={game.bgDeep} size="small" />
                    ) : (
                      <FontAwesome5 name="play" size={13} color={game.bgDeep} />
                    )}
                    <Text style={styles.modalDoubleBtnText}>
                      {offlineDoubleLoading ? "Carregando…" : "ASSISTIR E DOBRAR TUDO"}
                    </Text>
                    <View style={styles.multTag}>
                      <Text style={styles.multTagText}>2×</Text>
                    </View>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => handleOfflineClaim(false)}
                  style={({ pressed }) => [styles.modalClaimBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.modalClaimText}>Resgatar sem anúncio</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 16,
  },

  // ── Profile strip ──────────────────────────────────────────
  profileStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: game.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: game.border,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Inter_900Black",
    fontSize: 18,
  },
  profileMid: {
    flex: 1,
    gap: 3,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    flexShrink: 1,
  },
  vipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: game.gold,
  },
  vipText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 8,
  },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leagueText: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  trophyNum: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  xpTrack: {
    height: 4,
    backgroundColor: game.surfaceElevated,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  xpFill: {
    height: 4,
    backgroundColor: game.gold,
    borderRadius: 2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: game.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
    flexShrink: 0,
  },

  // ── Daily reward ───────────────────────────────────────────
  rewardBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: game.gold + "18",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: game.gold + "44",
  },
  rewardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: game.gold + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardTitle: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  rewardValue: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  rewardClose: {
    marginLeft: "auto",
  },

  // ── Hero ───────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  jetHalo: {
    position: "absolute",
    top: "10%",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: game.gold,
  },
  afterburner: {
    flexDirection: "row",
    gap: 22,
    marginTop: -16,
  },
  afterburnerLeft: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  afterburnerRight: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  titleBlock: {
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  titleEyebrow: {
    color: game.muted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 3,
  },
  titleMain: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 30,
    letterSpacing: 4,
  },
  titleRule: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: game.primary,
  },

  // ── Play section ───────────────────────────────────────────
  playSection: {
    gap: 10,
    alignItems: "center",
  },
  playShadow: {
    width: "100%",
    shadowColor: game.primary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
    borderRadius: 18,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: game.gold + "50",
  },
  playLabel: {
    color: "#fff",
    fontFamily: "Inter_900Black",
    fontSize: 22,
    letterSpacing: 5,
  },
  energyCostTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "#00000040",
    borderRadius: 8,
  },
  energyCostText: {
    color: game.energy,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  watchAdBtn: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
  },
  watchAdInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    paddingHorizontal: 16,
  },
  watchAdText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  mpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
  },
  mpChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // ── Stats ──────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: game.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: game.border,
    alignItems: "center",
    paddingVertical: 14,
    gap: 5,
  },
  statValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 16,
  },
  statLabel: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // ── Offline modal ──────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000CC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    overflow: "hidden",
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: game.gold + "55",
    gap: 12,
    backgroundColor: game.bgDeep,
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: game.gold + "20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: game.gold + "50",
  },
  modalTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 20,
    letterSpacing: 2,
  },
  modalSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    textAlign: "center",
  },
  modalRewards: {
    flexDirection: "row",
    gap: 14,
    marginVertical: 4,
  },
  modalRewardChip: {
    alignItems: "center",
    gap: 4,
    backgroundColor: game.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: game.border,
  },
  modalRewardVal: {
    fontFamily: "Inter_900Black",
    fontSize: 20,
  },
  modalRewardLabel: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  modalDoubleBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  modalDoubleBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  modalDoubleBtnText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  multTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#00000030",
  },
  multTagText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 12,
  },
  modalClaimBtn: {
    paddingVertical: 10,
  },
  modalClaimText: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
