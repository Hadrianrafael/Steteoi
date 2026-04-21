import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { PLAYER_NAMES } from "@/lib/gameEngine";

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ winner?: string; mapId?: string }>();
  const { addCoins, addGems, addXp, addTrophies, advanceCampaign } = useGame();

  const won = params.winner === "player";
  const winnerName = (PLAYER_NAMES as Record<string, string>)[params.winner ?? ""] ??
    "—";

  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const coins = won ? 250 : 50;
    const gems = won ? 5 : 1;
    const xp = won ? 80 : 20;
    const trophies = won ? 30 : -15;
    addCoins(coins);
    addGems(gems);
    addXp(xp);
    addTrophies(trophies);
    if (won) advanceCampaign();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const coins = won ? 250 : 50;
  const gems = won ? 5 : 1;
  const xp = won ? 80 : 20;
  const trophies = won ? 30 : -15;

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

      <Animated.View
        style={[styles.crown, { transform: [{ scale }] }]}
      >
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

      <Text style={styles.headline}>
        {won ? "VITÓRIA!" : "DERROTA"}
      </Text>
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
          value={`+${coins}`}
        />
        <Reward icon="gem" color={game.gem} label="Gemas" value={`+${gems}`} />
        <Reward
          icon="star"
          color={game.purple}
          label="XP"
          value={`+${xp}`}
        />
        <Reward
          icon="trophy"
          color={trophies > 0 ? game.success : game.danger}
          label="Troféus"
          value={`${trophies > 0 ? "+" : ""}${trophies}`}
        />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="JOGAR NOVAMENTE"
          variant="gold"
          onPress={() =>
            router.replace(`/play?mapId=${params.mapId ?? "usa"}` as never)
          }
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
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.rewardCard}>
      <View style={[styles.rewardIcon, { backgroundColor: color + "22" }]}>
        <FontAwesome5 name={icon} size={18} color={color} />
      </View>
      <Text style={styles.rewardValue}>{value}</Text>
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
    width: 100,
    padding: 14,
    backgroundColor: game.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: game.border,
    alignItems: "center",
    gap: 6,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
  },
  rewardLabel: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  actions: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 30,
    gap: 12,
  },
  menuBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  menuBtnText: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1.4,
  },
});
