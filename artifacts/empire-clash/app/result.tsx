import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { showRewardedAd } from "@/lib/admob";
import { PLAYER_NAMES } from "@/lib/gameEngine";

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ winner?: string }>();
  const { addCoins, addGems, addXp, addTrophies, addWin, addPlaneShards } = useGame();

  const won = params.winner === "player";
  const winnerName =
    (PLAYER_NAMES as Record<string, string>)[params.winner ?? ""] ?? "—";

  const shardReward = useRef<{ tier: 2 | 3 | 4 | 5; n: number }>({
    tier: (Math.floor(Math.random() * 4) + 2) as 2 | 3 | 4 | 5,
    n: won ? Math.floor(Math.random() * 2) + 2 : 1,
  }).current;

  const coins = won ? 250 : 50;
  const gems = won ? 5 : 1;
  const xp = won ? 80 : 20;
  const trophies = won ? 30 : -15;

  const [tripled, setTripled] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
    addCoins(coins);
    addGems(gems);
    addXp(xp);
    addTrophies(trophies);
    addPlaneShards(shardReward.tier, shardReward.n);
    if (won) addWin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTriple = () => {
    if (tripled || loadingAd) return;
    setLoadingAd(true);
    showRewardedAd({
      onEarned: () => {
        addCoins(coins * 2); // +2x = total 3x
        setTripled(true);
        setLoadingAd(false);
      },
      onDismissed: () => setLoadingAd(false),
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40 }]}>
      <LinearGradient
        colors={[
          (won ? game.gold : game.primary) + "44",
          game.bgDeep,
          game.bg,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.crown, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={
            won
              ? [game.gold, game.goldDark]
              : [game.surfaceElevated, game.surface]
          }
          style={styles.crownInner}
        >
          <FontAwesome5
            name={won ? "crown" : "skull-crossbones"}
            size={64}
            color={won ? game.bgDeep : game.text}
          />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.headline}>{won ? "VITÓRIA!" : "DERROTA"}</Text>
      <Text style={styles.sub}>
        {won
          ? "Você dominou o mapa, comandante."
          : `${winnerName} conquistou o mapa.`}
      </Text>

      <View style={styles.rewards}>
        <Reward
          icon="coins"
          color={game.gold}
          label="Moedas"
          value={tripled ? `+${coins * 3}` : `+${coins}`}
          boosted={tripled}
        />
        <Reward icon="gem" color={game.gem} label="Gemas" value={`+${gems}`} />
        <Reward icon="star" color={game.purple} label="XP" value={`+${xp}`} />
        <Reward
          icon="trophy"
          color={trophies > 0 ? game.success : game.danger}
          label="Troféus"
          value={`${trophies > 0 ? "+" : ""}${trophies}`}
        />
        <Reward
          icon="puzzle-piece"
          color={game.gem}
          label={`Figurinha T${shardReward.tier}`}
          value={`+${shardReward.n}`}
        />
      </View>

      {/* Triple coins rewarded ad */}
      {!tripled ? (
        <Pressable
          onPress={handleTriple}
          disabled={loadingAd}
          style={({ pressed }) => [
            styles.tripleBtn,
            { opacity: loadingAd ? 0.7 : pressed ? 0.85 : 1 },
          ]}
        >
          <LinearGradient
            colors={[game.gold, "#FF8E2E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tripleBtnInner}
          >
            {loadingAd ? (
              <ActivityIndicator color={game.bgDeep} />
            ) : (
              <FontAwesome5 name="play" size={14} color={game.bgDeep} />
            )}
            <Text style={styles.tripleBtnText}>
              {loadingAd
                ? "Carregando anúncio…"
                : "ASSISTIR PARA TRIPLICAR MOEDAS"}
            </Text>
            <View style={styles.tripleMultTag}>
              <Text style={styles.tripleMultText}>3×</Text>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <View style={styles.tripledBanner}>
          <FontAwesome5 name="check-circle" size={16} color={game.success} />
          <Text style={styles.tripledText}>
            Moedas triplicadas! +{coins * 3} moedas recebidas.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label="JOGAR NOVAMENTE"
          variant="gold"
          onPress={() => router.replace("/lobby")}
          icon={<FontAwesome5 name="redo" size={16} color={game.bgDeep} />}
        />
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.menuBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.menuBtnText}>VOLTAR AO MENU</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Reward({
  icon,
  color,
  label,
  value,
  boosted,
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  label: string;
  value: string;
  boosted?: boolean;
}) {
  return (
    <View style={[styles.rewardCard, boosted && { borderColor: game.gold, borderWidth: 1.5 }]}>
      <View style={[styles.rewardIcon, { backgroundColor: color + "22" }]}>
        <FontAwesome5 name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.rewardValue, boosted && { color: game.gold }]}>
        {value}
      </Text>
      <Text style={styles.rewardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  crown: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 6,
    backgroundColor: game.gold + "33",
  },
  crownInner: {
    flex: 1,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 42,
    letterSpacing: 4,
    marginTop: 22,
  },
  sub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 30,
  },
  rewardCard: {
    alignItems: "center",
    gap: 4,
    padding: 10,
    borderRadius: 14,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
    minWidth: 70,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
  tripleBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
  },
  tripleBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  tripleBtnText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 14,
    letterSpacing: 1,
    flex: 1,
    textAlign: "center",
  },
  tripleMultTag: {
    backgroundColor: game.bgDeep + "44",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tripleMultText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 16,
  },
  tripledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: game.success + "22",
    borderWidth: 1,
    borderColor: game.success + "55",
    width: "100%",
  },
  tripledText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  actions: { width: "100%", gap: 10, marginTop: 24 },
  menuBtn: { alignItems: "center", paddingVertical: 10 },
  menuBtnText: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
