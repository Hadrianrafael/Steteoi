import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

const SKILLS = [
  {
    key: "skillNuke" as const,
    name: "Bomba Tática",
    desc: "Reduz tropas inimigas pela metade no mapa inteiro",
    icon: "bomb" as const,
    color: game.danger,
    cost: 10,
  },
  {
    key: "skillRally" as const,
    name: "Reforço Imediato",
    desc: "+5 tropas em todos os seus territórios",
    icon: "users" as const,
    color: game.success,
    cost: 6,
  },
  {
    key: "skillShield" as const,
    name: "Escudo Defensivo",
    desc: "Defesa +15% por 8 segundos",
    icon: "shield-alt" as const,
    color: game.gem,
    cost: 8,
  },
];

export default function SkillsScreen() {
  const { profile, buySkill } = useGame();

  const handleBuy = (key: (typeof SKILLS)[number]["key"], cost: number) => {
    if (!buySkill(key, cost)) {
      Alert.alert("Gemas insuficientes");
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 40 }}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>ARSENAL</Text>
        <Text style={styles.heroTitle}>Habilidades Especiais</Text>
        <Text style={styles.heroSub}>
          Cargas usadas durante batalhas. Compre com gemas.
        </Text>
      </View>

      {SKILLS.map((s) => (
        <View key={s.key} style={[styles.card, { borderColor: s.color + "55" }]}>
          <View style={[styles.iconBox, { backgroundColor: s.color + "22" }]}>
            <FontAwesome5 name={s.icon} size={26} color={s.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{s.name}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
            <View style={styles.stockRow}>
              <FontAwesome5 name="boxes" size={10} color={game.gold} />
              <Text style={styles.stockText}>
                Estoque: {profile[s.key]}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => handleBuy(s.key, s.cost)}
            style={({ pressed }) => [
              styles.btn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <FontAwesome5 name="gem" size={11} color={game.gem} />
            <Text style={styles.btnText}>{s.cost}</Text>
          </Pressable>
        </View>
      ))}
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
    borderWidth: 1.5,
  },
  iconBox: {
    width: 56,
    height: 56,
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
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  stockText: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: game.bgDeep,
    borderWidth: 1,
    borderColor: game.border,
  },
  btnText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
});
