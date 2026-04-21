import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { UPGRADE_COSTS, useGame } from "@/contexts/GameContext";

const UPGRADES = [
  {
    key: "upgGrowth" as const,
    name: "Produção de Tropas",
    desc: "+20% de tropas geradas por território",
    icon: "users" as const,
    color: game.success,
  },
  {
    key: "upgAttack" as const,
    name: "Poder de Ataque",
    desc: "+3% de chance de vencer batalhas",
    icon: "fist-raised" as const,
    color: game.danger,
  },
  {
    key: "upgStart" as const,
    name: "Reservas Iniciais",
    desc: "+1 tropa inicial em cada território",
    icon: "warehouse" as const,
    color: game.gold,
  },
  {
    key: "upgPlaneSpeed" as const,
    name: "Velocidade Aérea",
    desc: "Aviões 100ms mais rápidos por nível",
    icon: "wind" as const,
    color: game.gem,
  },
];

const MAX = 5;

export default function UpgradesScreen() {
  const { profile, upgrade } = useGame();

  const handle = (key: (typeof UPGRADES)[number]["key"]) => {
    const lvl = profile[key];
    if (lvl >= MAX) {
      Alert.alert("Nível máximo");
      return;
    }
    if (!upgrade(key)) {
      Alert.alert("Moedas insuficientes");
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 40 }}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>LABORATÓRIO</Text>
        <Text style={styles.heroTitle}>Melhorias Permanentes</Text>
        <Text style={styles.heroSub}>
          Aplicadas em todas as próximas batalhas
        </Text>
      </View>

      {UPGRADES.map((u) => {
        const lvl = profile[u.key];
        const cost = UPGRADE_COSTS[u.key](lvl);
        const maxed = lvl >= MAX;
        return (
          <View key={u.key} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: u.color + "22" }]}>
              <FontAwesome5 name={u.icon} size={22} color={u.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{u.name}</Text>
              <Text style={styles.cardDesc}>{u.desc}</Text>
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
                <Text style={styles.lvlText}>
                  {lvl}/{MAX}
                </Text>
              </View>
            </View>
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
                <Text style={styles.btnText}>MAX</Text>
              ) : (
                <>
                  <FontAwesome5 name="coins" size={10} color={game.bgDeep} />
                  <Text style={[styles.btnText, { color: game.bgDeep }]}>
                    {cost}
                  </Text>
                </>
              )}
            </Pressable>
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
    backgroundColor: game.surface,
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
    fontSize: 18,
  },
  heroSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  cardDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: game.bgDeep,
  },
  lvlText: {
    marginLeft: 6,
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 76,
    justifyContent: "center",
  },
  btnText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 12,
  },
});
