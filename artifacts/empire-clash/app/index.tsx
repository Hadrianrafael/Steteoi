import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopBar } from "@/components/TopBar";
import { game } from "@/constants/colors";
import { CARD_DEFS, OfflineReward, useGame, xpProgress } from "@/contexts/GameContext";
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

  const [reward, setReward] = useState<{
    reward: number;
    type: "coins" | "gems";
  } | null>(null);
  const [energyAdLoading, setEnergyAdLoading] = useState(false);
  const [offlineModal, setOfflineModal] = useState(false);
  const [offlineDoubleLoading, setOfflineDoubleLoading] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const r = claimDailyLogin();
    if (r) setReward(r);
    touchActiveTs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingOfflineReward) setOfflineModal(true);
  }, [pendingOfflineReward]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [pulse, glow]);

  const handleEnergyAd = () => {
    if (energyAdLoading) return;
    setEnergyAdLoading(true);
    showRewardedAd({
      onEarned: () => {
        refillEnergy();
        setEnergyAdLoading(false);
      },
      onDismissed: () => setEnergyAdLoading(false),
    });
  };

  const xpFrac = xpProgress(profile);

  const handlePlay = () => {
    if (profile.energy < 1) return;
    haptic.play();
    router.push("/lobby");
  };

  const handleMultiplayer = () => {
    if (!multiplayerUnlocked) {
      Alert.alert(
        "Multiplayer bloqueado",
        `Alcance o nível 10 para jogar online com 5 jogadores reais. Nível atual: ${profile.level}.`,
      );
      return;
    }
    Alert.alert(
      "Em breve",
      "Servidor multiplayer em manutenção. Volte em breve!",
    );
  };

  const handleOfflineClaim = (doubled: boolean) => {
    claimOfflineReward(doubled);
    setOfflineModal(false);
  };

  const handleOfflineDouble = () => {
    setOfflineDoubleLoading(true);
    showRewardedAd({
      onEarned: () => {
        handleOfflineClaim(true);
        setOfflineDoubleLoading(false);
      },
      onDismissed: () => setOfflineDoubleLoading(false),
    });
  };

  type Quick = {
    label: string;
    icon: keyof typeof FontAwesome5.glyphMap;
    color: string;
    onPress: () => void;
    locked?: boolean;
  };

  const quickActions: Quick[] = [
    {
      label: "LOJA",
      icon: "store",
      color: game.gold,
      onPress: () => router.push("/shop"),
    },
    {
      label: "ARSENAL",
      icon: "fighter-jet",
      color: game.gem,
      onPress: () => router.push("/planes"),
    },
    {
      label: "MISSÕES",
      icon: "tasks",
      color: "#22C55E",
      onPress: () => router.push("/missions"),
    },
    {
      label: "CARTAS",
      icon: "layer-group",
      color: "#A78BFA",
      onPress: () => router.push("/cards"),
    },
  ];

  const quickRow2: Quick[] = [
    {
      label: "MELHORIAS",
      icon: "wrench",
      color: game.success,
      onPress: () => router.push("/upgrades"),
    },
    {
      label: "RANKING",
      icon: "trophy",
      color: "#F59E0B",
      onPress: () => router.push("/ranking"),
    },
    {
      label: multiplayerUnlocked ? "MULTI" : "NV 10",
      icon: multiplayerUnlocked ? "globe" : "lock",
      color: multiplayerUnlocked ? game.purple : game.muted,
      onPress: handleMultiplayer,
      locked: !multiplayerUnlocked,
    },
    {
      label: "HABILIDADES",
      icon: "magic",
      color: "#EC4899",
      onPress: () => router.push("/skills"),
    },
  ];

  // Mission progress summary
  const dailyMissions = 3;
  const dailyDone = 0; // placeholder — would derive from getMissions

  return (
    <View style={styles.root}>
      <Image
        source={require("../assets/images/menu-bg.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[game.bgDeep + "DD", game.bg + "BB", game.bgDeep + "F2"]}
        style={StyleSheet.absoluteFillObject}
      />

      <TopBar />

      <View style={styles.content}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <LinearGradient
              colors={[game.gold, game.primary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{profile.level}</Text>
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={styles.leagueRow}>
              <FontAwesome5
                name="trophy"
                size={11}
                color={
                  profile.league === "Diamante"
                    ? game.gem
                    : profile.league === "Ouro"
                      ? game.gold
                      : profile.league === "Prata"
                        ? "#C0C8D8"
                        : "#CD7F32"
                }
              />
              <Text style={styles.leagueText}>
                {profile.league} · {profile.trophies}
              </Text>
              {profile.vipActive && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipText}>VIP</Text>
                </View>
              )}
            </View>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${Math.min(100, xpFrac * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.xpLabel}>
              Nível {profile.level} · {profile.xp}/{profile.level * 100} XP
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.settingsBtn}
            hitSlop={10}
          >
            <Feather name="settings" size={18} color={game.text} />
          </Pressable>
        </View>

        {reward && (
          <View style={styles.rewardBanner}>
            <FontAwesome5
              name={reward.type === "gems" ? "gem" : "coins"}
              size={14}
              color={reward.type === "gems" ? game.gem : game.gold}
            />
            <Text style={styles.rewardText}>
              Recompensa diária: +{reward.reward}{" "}
              {reward.type === "gems" ? "gemas" : "moedas"}
            </Text>
          </View>
        )}

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.titleEyebrow}>BATALHA PELO</Text>
          <Text style={styles.titleMain}>EMPIRE CLASH</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* PLAY button */}
        <Animated.View
          style={[
            styles.playWrap,
            {
              transform: [{ scale: pulse }],
              shadowOpacity: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
              shadowRadius: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 28],
              }),
            },
          ]}
        >
          <Pressable
            onPress={handlePlay}
            disabled={profile.energy < 1}
            style={({ pressed }) => [
              { opacity: profile.energy < 1 ? 0.5 : pressed ? 0.85 : 1 },
            ]}
          >
            <LinearGradient
              colors={[game.gold, "#FF8E2E", game.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playBtn}
            >
              <FontAwesome5 name="crown" size={28} color={game.text} />
              <Text style={styles.playLabel}>JOGAR</Text>
              <View style={styles.playEnergyTag}>
                <FontAwesome5 name="bolt" size={11} color={game.energy} />
                <Text style={styles.playEnergyText}>1</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {profile.energy < 1 && (
          <Pressable
            onPress={handleEnergyAd}
            disabled={energyAdLoading}
            style={({ pressed }) => [
              styles.energyAdBtn,
              { opacity: energyAdLoading ? 0.7 : pressed ? 0.85 : 1 },
            ]}
          >
            {energyAdLoading ? (
              <ActivityIndicator color={game.text} size="small" />
            ) : (
              <FontAwesome5 name="play" size={12} color={game.text} />
            )}
            <Text style={styles.energyAdText}>
              {energyAdLoading
                ? "Carregando anúncio…"
                : "ASSISTIR PARA RECUPERAR ENERGIA"}
            </Text>
          </Pressable>
        )}

        {/* Quick action rows */}
        <View style={styles.quickRow}>
          {quickActions.map((q) => (
            <Pressable
              key={q.label}
              onPress={q.onPress}
              style={({ pressed }) => [
                styles.quickBtn,
                {
                  borderColor: q.color + "88",
                  backgroundColor: q.color + "22",
                  opacity: pressed ? 0.85 : q.locked ? 0.7 : 1,
                },
              ]}
            >
              <FontAwesome5 name={q.icon} size={18} color={q.color} />
              <Text
                style={[
                  styles.quickLabel,
                  q.locked && { color: game.muted },
                ]}
              >
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.quickRow}>
          {quickRow2.map((q) => (
            <Pressable
              key={q.label}
              onPress={q.onPress}
              style={({ pressed }) => [
                styles.quickBtn,
                {
                  borderColor: q.color + "88",
                  backgroundColor: q.color + "22",
                  opacity: pressed ? 0.85 : q.locked ? 0.7 : 1,
                },
              ]}
            >
              <FontAwesome5 name={q.icon} size={18} color={q.color} />
              <Text
                style={[
                  styles.quickLabel,
                  q.locked && { color: game.muted },
                ]}
              >
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingBottom: insets.bottom + 8 }} />

      {/* ── Offline Reward Modal ────────────────────────────────────────────── */}
      <Modal
        visible={offlineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setOfflineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <LinearGradient
              colors={[game.bgDeep, game.surface]}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.modalIcon}>
              <FontAwesome5 name="gift" size={36} color={game.gold} />
            </View>

            <Text style={styles.modalTitle}>RECOMPENSA OFFLINE</Text>
            {pendingOfflineReward && (
              <>
                <Text style={styles.modalSub}>
                  Você ficou ausente por{" "}
                  {pendingOfflineReward.hoursAway}h
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
                      <FontAwesome5
                        name="layer-group"
                        size={18}
                        color="#A78BFA"
                      />
                      <Text
                        style={[
                          styles.modalRewardVal,
                          { color: "#A78BFA" },
                        ]}
                      >
                        +{pendingOfflineReward.cards.length}
                      </Text>
                      <Text style={styles.modalRewardLabel}>carta(s)</Text>
                    </View>
                  )}
                </View>

                {/* Double via ad */}
                <Pressable
                  onPress={handleOfflineDouble}
                  disabled={offlineDoubleLoading}
                  style={({ pressed }) => [
                    styles.modalDoubleBtn,
                    {
                      opacity: offlineDoubleLoading
                        ? 0.7
                        : pressed
                          ? 0.85
                          : 1,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[game.gold, "#FF8E2E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalDoubleBtnInner}
                  >
                    {offlineDoubleLoading ? (
                      <ActivityIndicator color={game.bgDeep} size="small" />
                    ) : (
                      <FontAwesome5 name="play" size={13} color={game.bgDeep} />
                    )}
                    <Text style={styles.modalDoubleBtnText}>
                      {offlineDoubleLoading
                        ? "Carregando…"
                        : "ASSISTIR E DOBRAR TUDO"}
                    </Text>
                    <View style={styles.multTag}>
                      <Text style={styles.multTagText}>2×</Text>
                    </View>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => handleOfflineClaim(false)}
                  style={({ pressed }) => [
                    styles.modalClaimBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
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
  content: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: "center",
    gap: 12,
  },
  profileCard: {
    padding: 14,
    backgroundColor: game.surface + "E6",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 30,
    backgroundColor: game.gold,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 20,
  },
  profileName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  leagueText: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
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
    fontSize: 9,
  },
  xpBar: {
    height: 5,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    marginTop: 7,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: game.gold,
  },
  xpLabel: {
    color: game.muted,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: game.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  rewardBanner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: game.gold + "22",
    borderWidth: 1,
    borderColor: game.gold + "55",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  titleWrap: {
    alignItems: "center",
    gap: 3,
  },
  titleEyebrow: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 4,
  },
  titleMain: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 28,
    letterSpacing: 3,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: game.primary,
    marginTop: 3,
  },
  playWrap: {
    alignSelf: "center",
    shadowColor: game.primary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
    borderRadius: 100,
  },
  playBtn: {
    width: 155,
    height: 155,
    borderRadius: 78,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 4,
    borderColor: game.gold + "AA",
  },
  playLabel: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 26,
    letterSpacing: 4,
  },
  playEnergyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: game.bgDeep + "AA",
    borderRadius: 10,
  },
  playEnergyText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  energyAdBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: game.success,
  },
  energyAdText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 1,
  },
  quickRow: {
    flexDirection: "row",
    gap: 7,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 5,
  },
  quickLabel: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  // Modal
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
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: game.gold + "22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: game.gold + "55",
  },
  modalTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
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
    gap: 16,
    marginVertical: 4,
  },
  modalRewardChip: {
    alignItems: "center",
    gap: 4,
    backgroundColor: game.bgDeep,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: game.border,
  },
  modalRewardVal: {
    fontFamily: "Inter_900Black",
    fontSize: 22,
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
    marginTop: 6,
  },
  modalDoubleBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  modalDoubleBtnText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  multTag: {
    backgroundColor: game.bgDeep + "55",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  multTagText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 15,
  },
  modalClaimBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalClaimText: {
    color: game.muted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
