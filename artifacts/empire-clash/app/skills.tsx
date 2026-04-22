import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { useGame, type SkillKey } from "@/contexts/GameContext";

const SKILLS: {
  key: SkillKey;
  name: string;
  desc: string;
  icon: keyof typeof import("@expo/vector-icons/FontAwesome5").default.glyphMap;
  color: string;
  cost: number;
}[] = [
  {
    key: "skillNuke",
    name: "Bomba Tática",
    desc: "Reduz tropas inimigas pela metade no mapa inteiro",
    icon: "bomb",
    color: game.danger,
    cost: 10,
  },
  {
    key: "skillRally",
    name: "Reforço Imediato",
    desc: "+5 tropas em todos os seus territórios",
    icon: "users",
    color: game.success,
    cost: 6,
  },
  {
    key: "skillShield",
    name: "Escudo Defensivo",
    desc: "Defesa +15% por 8 segundos",
    icon: "shield-alt",
    color: game.gem,
    cost: 8,
  },
  {
    key: "skillFury",
    name: "Fúria de Guerra",
    desc: "+30% de chance de vitória em ataques por 10 segundos",
    icon: "fire",
    color: "#FF6A1A",
    cost: 12,
  },
  {
    key: "skillFreeze",
    name: "Congelar Inimigos",
    desc: "IAs inimigas paralisam por 5 segundos",
    icon: "snowflake",
    color: "#7FD8FF",
    cost: 14,
  },
  {
    key: "skillSpy",
    name: "Espião Tático",
    desc: "Revela movimentos do inimigo por 10 segundos",
    icon: "user-secret",
    color: game.purple,
    cost: 9,
  },
];

export default function SkillsScreen() {
  const { profile, buySkill } = useGame();

  const handleBuy = (key: SkillKey, cost: number) => {
    if (!buySkill(key, cost)) {
      Alert.alert("Gemas insuficientes");
    }
  };

  const totalSkills =
    profile.skillNuke +
    profile.skillRally +
    profile.skillShield +
    profile.skillFury +
    profile.skillFreeze +
    profile.skillSpy;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 40 }}
    >
      <LinearGradient
        colors={[game.purple + "55", game.surface]}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>ARSENAL TÁTICO</Text>
        <Text style={styles.heroTitle}>6 Habilidades Especiais</Text>
        <Text style={styles.heroSub}>
          {totalSkills} cargas no estoque. Use durante batalhas.
        </Text>
      </LinearGradient>

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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: game.purple + "55",
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
