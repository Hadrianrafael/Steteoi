import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { PLANE_COSTS, useGame, type PlaneTier } from "@/contexts/GameContext";

const PLANES: {
  tier: PlaneTier;
  name: string;
  desc: string;
  speed: string;
  color: string;
  icon: keyof typeof FontAwesome5.glyphMap;
}[] = [
  {
    tier: 1,
    name: "Caça Padrão",
    desc: "Avião básico, transporta tropas em rotas longas",
    speed: "1.3s",
    color: game.gem,
    icon: "paper-plane",
  },
  {
    tier: 2,
    name: "Bombardeiro",
    desc: "+25% velocidade. Cargas mais agressivas",
    speed: "1.0s",
    color: game.gold,
    icon: "fighter-jet",
  },
  {
    tier: 3,
    name: "Drone Hipersônico",
    desc: "Velocidade quase instantânea entre continentes",
    speed: "0.7s",
    color: game.primary,
    icon: "rocket",
  },
];

export default function PlanesScreen() {
  const { profile, upgradePlane } = useGame();

  const handleUpgrade = () => {
    if (profile.planeTier >= 3) {
      Alert.alert("Frota máxima", "Você já tem a melhor aeronave.");
      return;
    }
    const ok = upgradePlane();
    if (!ok) {
      Alert.alert("Moedas insuficientes");
      return;
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 40 }}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>FROTA AÉREA</Text>
        <Text style={styles.heroTitle}>Aviões Atuais: Tier {profile.planeTier}</Text>
        <Text style={styles.heroSub}>
          Aeronaves transportam tropas para territórios distantes
        </Text>
      </View>

      {PLANES.map((p) => {
        const owned = profile.planeTier >= p.tier;
        const isCurrent = profile.planeTier === p.tier;
        const isNext = profile.planeTier + 1 === p.tier;
        return (
          <View
            key={p.tier}
            style={[
              styles.card,
              isCurrent && { borderColor: game.gold },
              !owned && !isNext && { opacity: 0.55 },
            ]}
          >
            <LinearGradient
              colors={[p.color + "33", "transparent"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.iconBox, { backgroundColor: p.color + "22" }]}>
              <FontAwesome5 name={p.icon} size={32} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                {isCurrent && (
                  <View style={[styles.badge, { backgroundColor: game.gold }]}>
                    <Text style={styles.badgeText}>EQUIPADO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDesc}>{p.desc}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaTag}>
                  <FontAwesome5 name="bolt" size={9} color={game.energy} />
                  <Text style={styles.metaText}>{p.speed}</Text>
                </View>
                <View style={styles.metaTag}>
                  <FontAwesome5 name="layer-group" size={9} color={game.gem} />
                  <Text style={styles.metaText}>Tier {p.tier}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}

      {profile.planeTier < 3 && (
        <Pressable onPress={handleUpgrade} style={styles.cta}>
          <LinearGradient
            colors={[game.gold, game.goldDark]}
            style={styles.ctaInner}
          >
            <FontAwesome5 name="arrow-up" size={18} color={game.bgDeep} />
            <Text style={styles.ctaText}>
              EVOLUIR FROTA · {PLANE_COSTS[(profile.planeTier + 1) as PlaneTier]} moedas
            </Text>
          </LinearGradient>
        </Pressable>
      )}
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
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    borderColor: game.border,
    overflow: "hidden",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
  },
  cardDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: game.bgDeep,
  },
  metaText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
  },
  cta: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  ctaInner: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 14,
    letterSpacing: 1,
  },
});
