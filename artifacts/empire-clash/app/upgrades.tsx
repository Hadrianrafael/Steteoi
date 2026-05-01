import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { game } from "@/constants/colors";
import { UPGRADE_COSTS, useGame } from "@/contexts/GameContext";
import { showRewardedAd } from "@/lib/admob";



const UPGRADES = [
  {
    key: "upgGrowth" as const,
    category: "PRODUÇÃO",
    name: "Produção de Tropas",
    desc: "Tropas geradas por território",
    valueBefore: (lvl: number) => `+${(lvl * 0.05).toFixed(2)}/s`,
    valueAfter: (lvl: number) => `+${((lvl + 1) * 0.05).toFixed(2)}/s`,
    icon: "industry" as const,
    color: game.success,
  },
  {
    key: "upgAttack" as const,
    category: "GUARNIÇÃO",
    name: "Poder de Ataque",
    desc: "Chance de vencer batalhas",
    valueBefore: (lvl: number) => `${50 + lvl * 3}%`,
    valueAfter: (lvl: number) => `${50 + (lvl + 1) * 3}%`,
    icon: "fist-raised" as const,
    color: game.danger,
  },
  {
    key: "upgStart" as const,
    category: "CAPACIDADE",
    name: "Reservas Iniciais",
    desc: "Tropas em cada território",
    valueBefore: (lvl: number) => `${5 + lvl}`,
    valueAfter: (lvl: number) => `${5 + lvl + 1}`,
    icon: "warehouse" as const,
    color: game.gold,
  },
  {
    key: "upgPlaneSpeed" as const,
    category: "GUARNIÇÃO",
    name: "Velocidade Aérea",
    desc: "Tempo de voo dos aviões",
    valueBefore: (lvl: number) => `${(1.3 - lvl * 0.1).toFixed(1)}s`,
    valueAfter: (lvl: number) => `${(1.3 - (lvl + 1) * 0.1).toFixed(1)}s`,
    icon: "wind" as const,
    color: game.gem,
  },
];

const MAX = 5;
const CATEGORIES = ["GUARNIÇÃO", "PRODUÇÃO", "CAPACIDADE"] as const;

export default function UpgradesScreen() {
  const { profile, upgrade, freeUpgrade } = useGame();
  const [adLoading, setAdLoading] = useState<(typeof UPGRADES)[number]["key"] | null>(null);

  const watchAdForUpgrade = (key: (typeof UPGRADES)[number]["key"]) => {
    if (adLoading) return;
    setAdLoading(key);
    showRewardedAd({
      onEarned: () => {
        if (freeUpgrade(key)) Alert.alert("Upgrade grátis!", "Recompensa do anúncio aplicada.");
        setAdLoading(null);
      },
      onDismissed: () => setAdLoading(null),
    });
  };

  const handle = (key: (typeof UPGRADES)[number]["key"]) => {
    const lvl = profile[key];
    if (lvl >= MAX) {
      Alert.alert("Nível máximo");
      return;
    }
    if (!upgrade(key)) {
      Alert.alert("Sem moedas", "Assista um vídeo para upgrade grátis.");
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: 40 }}
    >
      <LinearGradient
        colors={[game.gold + "44", game.surface]}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>LABORATÓRIO</Text>
        <Text style={styles.heroTitle}>Suas Melhorias</Text>
        <Text style={styles.heroSub}>
          Aplicadas em todas as próximas batalhas
        </Text>
      </LinearGradient>

      {CATEGORIES.map((cat) => {
        const items = UPGRADES.filter((u) => u.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat}>
            <Text style={styles.categoryTitle}>{cat}</Text>
            <View style={{ gap: 10 }}>
              {items.map((u) => {
                const lvl = profile[u.key];
                const cost = UPGRADE_COSTS[u.key](lvl);
                const maxed = lvl >= MAX;
                return (
                  <View key={u.key} style={styles.card}>
                    <LinearGradient
                      colors={[u.color + "22", "transparent"]}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.cardTop}>
                      <View style={[styles.iconBox, { backgroundColor: u.color + "44" }]}>
                        <FontAwesome5 name={u.icon} size={22} color={u.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{u.name}</Text>
                        <Text style={styles.cardDesc}>{u.desc}</Text>
                      </View>
                      <View style={styles.lvlPill}>
                        <Text style={styles.lvlPillText}>NV {lvl}</Text>
                      </View>
                    </View>

                    {/* Before/After visual */}
                    <View style={styles.beforeAfter}>
                      <View style={styles.baBox}>
                        <Text style={styles.baLabel}>ATUAL</Text>
                        <Text style={[styles.baValue, { color: game.textDim }]}>
                          {u.valueBefore(lvl)}
                        </Text>
                      </View>
                      <FontAwesome5 name="arrow-right" size={14} color={u.color} />
                      <View style={styles.baBox}>
                        <Text style={[styles.baLabel, { color: u.color }]}>PRÓX.</Text>
                        <Text style={[styles.baValue, { color: u.color }]}>
                          {maxed ? "MAX" : u.valueAfter(lvl)}
                        </Text>
                      </View>
                    </View>

                    {/* Dots progress */}
                    <View style={styles.dotRow}>
                      {Array.from({ length: MAX }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            i < lvl && { backgroundColor: u.color },
                          ]}
                        />
                      ))}
                    </View>

                    {/* Action row */}
                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => handle(u.key)}
                        disabled={maxed}
                        style={({ pressed }) => [
                          styles.btn,
                          {
                            backgroundColor: maxed ? game.surfaceElevated : u.color,
                            opacity: maxed ? 0.5 : pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        {maxed ? (
                          <Text style={styles.btnText}>MÁXIMO</Text>
                        ) : (
                          <>
                            <FontAwesome5 name="coins" size={11} color={game.text} />
                            <Text style={styles.btnText}>{cost}</Text>
                          </>
                        )}
                      </Pressable>
                      {!maxed && (
                        <Pressable
                          onPress={() => watchAdForUpgrade(u.key)}
                          disabled={!!adLoading}
                          style={({ pressed }) => [
                            styles.adBtn,
                            { opacity: adLoading ? 0.7 : pressed ? 0.85 : 1 },
                          ]}
                        >
                          {adLoading === u.key ? (
                            <ActivityIndicator size="small" color={game.text} />
                          ) : (
                            <FontAwesome5 name="play" size={10} color={game.text} />
                          )}
                          <Text style={styles.adBtnText}>VÍDEO</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  hero: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: game.border,
    gap: 4,
  },
  heroEyebrow: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  heroTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
  },
  heroSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  categoryTitle: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
    overflow: "hidden",
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
  cardDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
  },
  lvlPill: {
    backgroundColor: game.bgDeep,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: game.gold,
  },
  lvlPillText: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },
  beforeAfter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: game.bgDeep + "66",
    padding: 8,
    borderRadius: 10,
  },
  baBox: { alignItems: "center", minWidth: 70 },
  baLabel: {
    color: game.textDim,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1,
  },
  baValue: {
    fontFamily: "Inter_900Black",
    fontSize: 16,
    marginTop: 2,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: game.bgDeep,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  btnText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  adBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: game.success,
  },
  adBtnText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 1,
  },
});
