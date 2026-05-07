import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { game } from "@/constants/colors";
import { CARD_DEFS, rollCard, useGame } from "@/contexts/GameContext";
import { showInterstitialAd } from "@/services/admob";
import { haptic } from "@/services/haptics";
import { showRewardedAd } from "@/lib/admob";
import { PLAYER_NAMES } from "@/lib/gameEngine";

const RARITY_COLOR: Record<string, string> = {
  legendary: "#FFD700",
  epic: "#A855F7",
  rare: "#3B82F6",
  uncommon: "#22C55E",
  common: "#94A3B8",
};

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ winner?: string }>();
  const {
    addCoins,
    addGems,
    addXp,
    addTrophies,
    addWin,
    addPlaneShards,
    addCards,
    recordMissionStat,
    touchActiveTs,
  } = useGame();

  const won = params.winner === "player";
  const winnerName =
    (PLAYER_NAMES as Record<string, string>)[params.winner ?? ""] ?? "—";

  const shardReward = useRef<{ tier: 2 | 3 | 4 | 5; n: number }>({
    tier: (Math.floor(Math.random() * 4) + 2) as 2 | 3 | 4 | 5,
    n: won ? Math.floor(Math.random() * 2) + 2 : 1,
  }).current;

  const cardReward = useRef<string[]>(
    Array.from({ length: won ? 2 : 1 }, () => rollCard()),
  ).current;

  const coins = won ? 250 : 50;
  const gems = won ? 5 : 1;
  const xp = won ? 80 : 20;
  const trophies = won ? 30 : -15;

  const [tripled, setTripled] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);

  // Entrance animations
  const crownScale = useRef(new Animated.Value(0)).current;
  const crownRotate = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(30)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const rewardsY = useRef(new Animated.Value(40)).current;
  const rewardsOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Crown entrance
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(crownScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(crownRotate, { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
    ]).start();

    // Headline fade up
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(headlineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headlineY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    // Rewards slide up
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(rewardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(rewardsY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    // Glow pulse (only on win)
    if (won) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 1, duration: 1400, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(glowPulse, { toValue: 0, duration: 1400, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
        ]),
      ).start();
    }

    addCoins(coins);
    addGems(gems);
    addXp(xp);
    addTrophies(trophies);
    addPlaneShards(shardReward.tier, shardReward.n);
    addCards(cardReward);
    recordMissionStat("gamesPlayed", 1);
    recordMissionStat("coinsEarned", coins);
    if (won) {
      addWin();
      recordMissionStat("gamesWon", 1);
      haptic.victory();
    } else {
      haptic.error();
    }
    touchActiveTs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateWithInterstitial = (action: () => void) => {
    haptic.click();
    if (Math.random() < 0.5) {
      showInterstitialAd({ onClosed: action });
    } else {
      action();
    }
  };

  const handleTriple = () => {
    if (tripled || loadingAd) return;
    setLoadingAd(true);
    showRewardedAd({
      onEarned: () => {
        addCoins(coins * 2);
        addCards(cardReward);
        setTripled(true);
        setLoadingAd(false);
      },
      onDismissed: () => setLoadingAd(false),
    });
  };

  const cardDefs = cardReward.map((id) => CARD_DEFS.find((c) => c.id === id)!);

  const crownSpin = crownRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "0deg"],
  });

  const glowSize = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [130, 200] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[
          (won ? game.gold : game.primary) + "33",
          game.bgDeep + "EE",
          game.bgDeep,
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Pulsing glow orb behind crown (win only) */}
      {won && (
        <Animated.View
          pointerEvents="none"
          style={[styles.glowOrb, { width: glowSize, height: glowSize, borderRadius: 200, opacity: glowOpacity }]}
        />
      )}

      {/* Crown / skull */}
      <Animated.View
        style={[
          styles.crown,
          {
            transform: [{ scale: crownScale }, { rotate: crownSpin }],
            borderColor: (won ? game.gold : game.surfaceElevated) + "88",
          },
        ]}
      >
        <LinearGradient
          colors={won ? [game.gold, "#E8920A"] : [game.surfaceElevated, game.surface]}
          style={styles.crownInner}
        >
          <FontAwesome5
            name={won ? "crown" : "skull-crossbones"}
            size={60}
            color={won ? game.bgDeep : game.textDim}
          />
        </LinearGradient>
      </Animated.View>

      {/* Headline */}
      <Animated.View style={{ transform: [{ translateY: headlineY }], opacity: headlineOpacity, alignItems: "center" }}>
        <Text style={[styles.headline, { color: won ? game.gold : game.text }]}>
          {won ? "VITÓRIA!" : "DERROTA"}
        </Text>
        <Text style={styles.sub}>
          {won ? "Você dominou o mapa, comandante." : `${winnerName} conquistou o mapa.`}
        </Text>
      </Animated.View>

      {/* Rewards */}
      <Animated.View
        style={[styles.rewardsSection, { transform: [{ translateY: rewardsY }], opacity: rewardsOpacity }]}
      >
        <View style={styles.rewards}>
          <RewardCard icon="coins"  color={game.gold}                       label="Moedas"  value={tripled ? `+${coins * 3}` : `+${coins}`} boosted={tripled} />
          <RewardCard icon="gem"    color={game.gem}                        label="Gemas"   value={`+${gems}`} />
          <RewardCard icon="star"   color={game.purple}                     label="XP"      value={`+${xp}`} />
          <RewardCard icon="trophy" color={trophies > 0 ? game.gold : game.danger} label="Troféus" value={`${trophies > 0 ? "+" : ""}${trophies}`} />
        </View>

        {/* Card rewards */}
        {cardDefs.length > 0 && (
          <View style={styles.cardRow}>
            {cardDefs.map((cd, i) => {
              if (!cd) return null;
              const col = RARITY_COLOR[cd.rarity] ?? game.muted;
              const iconName = cd.color === "blue" ? "star" : cd.color === "red" ? "fire" : "coins";
              return (
                <View key={i} style={[styles.cardChip, { borderColor: col + "66" }]}>
                  <LinearGradient
                    colors={[col + "28", "transparent"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <FontAwesome5 name={iconName} size={14} color={col} />
                  <Text style={styles.cardChipName} numberOfLines={1}>{cd.name}</Text>
                  <View style={[styles.rarityDot, { backgroundColor: col }]} />
                </View>
              );
            })}
          </View>
        )}

        {/* Double rewards button */}
        {!tripled ? (
          <Pressable
            onPress={handleTriple}
            disabled={loadingAd}
            style={({ pressed }) => [
              styles.doubleBtn,
              { opacity: loadingAd ? 0.65 : pressed ? 0.85 : 1 },
            ]}
          >
            <LinearGradient
              colors={[game.gold, "#E8920A"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.doubleBtnInner}
            >
              {loadingAd
                ? <ActivityIndicator color={game.bgDeep} size="small" />
                : <FontAwesome5 name="play" size={13} color={game.bgDeep} />
              }
              <Text style={styles.doubleBtnText}>
                {loadingAd ? "Carregando…" : "ASSISTIR E DOBRAR RECOMPENSAS"}
              </Text>
              <View style={styles.multTag}>
                <Text style={styles.multTagText}>2×</Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.doubledBanner}>
            <FontAwesome5 name="check-circle" size={16} color={game.success} />
            <Text style={styles.doubledText}>
              Recompensas dobradas! +{coins * 3} moedas e +{cardReward.length * 2} cartas.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton
            label="JOGAR NOVAMENTE"
            variant="gold"
            onPress={() => navigateWithInterstitial(() => router.replace("/lobby"))}
            icon={<FontAwesome5 name="redo" size={15} color={game.bgDeep} />}
          />
          <Pressable
            onPress={() => navigateWithInterstitial(() => router.replace("/"))}
            style={({ pressed }) => [styles.menuBtn, { opacity: pressed ? 0.65 : 1 }]}
          >
            <Text style={styles.menuBtnText}>VOLTAR AO MENU</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

function RewardCard({
  icon, color, label, value, boosted,
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  label: string;
  value: string;
  boosted?: boolean;
}) {
  return (
    <View style={[styles.rewardCard, boosted && { borderColor: game.gold, borderWidth: 2 }]}>
      <View style={[styles.rewardIconBg, { backgroundColor: color + "20" }]}>
        <FontAwesome5 name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.rewardValue, boosted && { color: game.gold }]}>{value}</Text>
      <Text style={styles.rewardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", paddingHorizontal: 20, backgroundColor: game.bgDeep },
  glowOrb: {
    position: "absolute",
    top: "10%",
    alignSelf: "center",
    backgroundColor: game.gold,
  },
  crown: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 2,
    padding: 5,
    backgroundColor: "transparent",
    marginBottom: 16,
  },
  crownInner: {
    flex: 1,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    fontFamily: "Inter_900Black",
    fontSize: 42,
    letterSpacing: 5,
  },
  sub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  rewardsSection: {
    width: "100%",
    alignItems: "center",
    gap: 14,
    marginTop: 20,
  },
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  rewardCard: {
    alignItems: "center",
    gap: 5,
    padding: 12,
    borderRadius: 18,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
    minWidth: 72,
  },
  rewardIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 15,
  },
  rewardLabel: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  cardRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  cardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    overflow: "hidden",
    maxWidth: 160,
  },
  cardChipName: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    flex: 1,
  },
  rarityDot: { width: 7, height: 7, borderRadius: 4 },
  doubleBtn: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: game.gold,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  doubleBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  doubleBtnText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 0.8,
    flex: 1,
    textAlign: "center",
  },
  multTag: {
    backgroundColor: game.bgDeep + "55",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  multTagText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 16,
  },
  doubledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: game.success + "20",
    borderWidth: 1,
    borderColor: game.success + "55",
    width: "100%",
  },
  doubledText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    flex: 1,
  },
  actions: { width: "100%", gap: 10 },
  menuBtn: { alignItems: "center", paddingVertical: 12 },
  menuBtnText: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
