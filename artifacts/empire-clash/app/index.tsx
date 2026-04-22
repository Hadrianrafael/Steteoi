import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";
import { game } from "@/constants/colors";
import { useGame, xpProgress } from "@/contexts/GameContext";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, claimDailyLogin } = useGame();
  const [reward, setReward] = useState<{
    reward: number;
    type: "coins" | "gems";
  } | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const r = claimDailyLogin();
    if (r) setReward(r);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
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

  const xpFrac = xpProgress(profile);

  const handlePlay = () => {
    if (profile.energy < 1) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    router.push("/lobby");
  };

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
          <Text style={styles.noEnergy}>
            Sem energia. Aguarde recarga ou use a loja.
          </Text>
        )}
      </View>

      <View style={{ paddingBottom: insets.bottom }}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    gap: 22,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
  },
  profileName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
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
    height: 6,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    marginTop: 8,
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
    marginTop: 4,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 4,
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
    fontSize: 36,
    letterSpacing: 3,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: game.primary,
    marginTop: 4,
  },
  playWrap: {
    alignSelf: "center",
    shadowColor: game.primary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
    borderRadius: 100,
  },
  playBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 4,
    borderColor: game.gold + "AA",
  },
  playLabel: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 32,
    letterSpacing: 4,
  },
  playEnergyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: game.bgDeep + "AA",
    borderRadius: 10,
  },
  playEnergyText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  noEnergy: {
    color: game.danger,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
});
