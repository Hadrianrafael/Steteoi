import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { PLANE_COSTS, useGame, type PlaneTier } from "@/contexts/GameContext";

type Hero = {
  tier: PlaneTier;
  name: string;
  ability: string;
  rarity: "Comum" | "Raro" | "Épico" | "Lendário" | "Mítico";
  rarityColor: string;
  color: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  unlockShards: number;
};

const HEROES: Hero[] = [
  {
    tier: 1,
    name: "Caça Padrão",
    ability: "Velocidade base",
    rarity: "Comum",
    rarityColor: "#7E8896",
    color: "#3FD0FF",
    icon: "paper-plane",
    unlockShards: 0,
  },
  {
    tier: 2,
    name: "Bombardeiro",
    ability: "+25% velocidade",
    rarity: "Raro",
    rarityColor: "#3FD0FF",
    color: game.gold,
    icon: "fighter-jet",
    unlockShards: 10,
  },
  {
    tier: 3,
    name: "Caça Stealth",
    ability: "Invisível ao radar",
    rarity: "Épico",
    rarityColor: "#9B5DFF",
    color: game.purple,
    icon: "plane",
    unlockShards: 25,
  },
  {
    tier: 4,
    name: "Drone Hipersônico",
    ability: "Velocidade extrema",
    rarity: "Lendário",
    rarityColor: "#FFB300",
    color: game.primary,
    icon: "rocket",
    unlockShards: 50,
  },
  {
    tier: 5,
    name: "Frota Imperial",
    ability: "Aura intimidadora",
    rarity: "Mítico",
    rarityColor: "#FF3DBE",
    color: game.gold,
    icon: "crown",
    unlockShards: 100,
  },
];

export default function PlanesScreen() {
  const { profile, upgradePlane, selectSkin } = useGame();

  const handleEquip = (h: Hero) => {
    if (profile.planeTier >= h.tier) {
      Alert.alert("Equipado", `${h.name} agora é sua frota ativa.`);
      selectSkin(profile.selectedSkin);
      return;
    }
    if (profile.planeTier + 1 === h.tier) {
      const ok = upgradePlane();
      if (!ok) Alert.alert("Moedas insuficientes", `Custa ${PLANE_COSTS[h.tier]} moedas para desbloquear.`);
      else Alert.alert("Desbloqueado!", `${h.name} agora faz parte da sua frota.`);
      return;
    }
    Alert.alert("Bloqueado", "Evolua sua frota em ordem para desbloquear.");
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}
    >
      <LinearGradient
        colors={[game.gem + "55", game.surface]}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>FROTA AÉREA · COLEÇÃO</Text>
        <Text style={styles.heroTitle}>Personagens</Text>
        <Text style={styles.heroSub}>
          Desbloqueie aviões mais raros para batalhas avançadas
        </Text>
      </LinearGradient>

      <View style={styles.grid}>
        {HEROES.map((h) => {
          const owned = profile.planeTier >= h.tier;
          const isCurrent = profile.planeTier === h.tier;
          const isNext = profile.planeTier + 1 === h.tier;
          const locked = !owned && !isNext;
          const progress = owned ? 1 : isNext ? Math.min(profile.coins / PLANE_COSTS[h.tier], 1) : 0;
          const lvl = h.tier;

          return (
            <View key={h.tier} style={[styles.card, isCurrent && { borderColor: game.gold }]}>
              <LinearGradient
                colors={[h.color + "33", "transparent"]}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Rarity bar */}
              <View style={[styles.rarityBar, { backgroundColor: h.rarityColor }]}>
                <Text style={styles.rarityText}>{h.rarity.toUpperCase()}</Text>
              </View>

              {/* Hero icon */}
              <View style={[styles.iconBig, { backgroundColor: h.color + "44", borderColor: h.color }]}>
                {locked ? (
                  <FontAwesome5 name="lock" size={36} color={game.muted} />
                ) : (
                  <FontAwesome5 name={h.icon} size={42} color={h.color} />
                )}
              </View>

              {/* Level badge */}
              <View style={styles.lvlBadge}>
                <Text style={styles.lvlBadgeText}>NV {lvl}</Text>
              </View>

              {/* Name */}
              <Text style={[styles.cardName, locked && { color: game.muted }]}>
                {locked ? "AINDA NÃO ENCONTRADO" : h.name}
              </Text>
              <Text style={styles.cardAbility}>
                {locked ? "Continue evoluindo" : h.ability}
              </Text>

              {/* Progress */}
              <View style={styles.progressWrap}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%`, backgroundColor: h.color },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {owned
                    ? "DESBLOQUEADO"
                    : `${profile.coins.toLocaleString("pt-BR")} / ${PLANE_COSTS[h.tier].toLocaleString("pt-BR")}`}
                </Text>
              </View>

              {/* Action button */}
              <Pressable
                onPress={() => handleEquip(h)}
                disabled={locked}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: isCurrent
                      ? game.gold
                      : owned
                        ? game.surfaceElevated
                        : isNext
                          ? h.color
                          : game.surfaceElevated,
                    opacity: locked ? 0.4 : pressed ? 0.85 : 1,
                  },
                ]}
              >
                {isCurrent ? (
                  <Text style={[styles.actionText, { color: game.bgDeep }]}>EQUIPADO</Text>
                ) : owned ? (
                  <Text style={styles.actionText}>EQUIPAR</Text>
                ) : isNext ? (
                  <>
                    <FontAwesome5 name="coins" size={11} color={game.text} />
                    <Text style={styles.actionText}>{PLANE_COSTS[h.tier]}</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="lock" size={11} color={game.muted} />
                    <Text style={[styles.actionText, { color: game.muted }]}>BLOQUEADO</Text>
                  </>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  hero: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: game.gem + "55",
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    padding: 12,
    paddingTop: 28,
    borderRadius: 18,
    backgroundColor: game.surface,
    borderWidth: 2,
    borderColor: game.border,
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  rarityBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
    alignItems: "center",
  },
  rarityText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  iconBig: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  lvlBadge: {
    position: "absolute",
    top: 28,
    right: 12,
    backgroundColor: game.bgDeep,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: game.gold,
  },
  lvlBadgeText: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 10,
  },
  cardName: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    textAlign: "center",
    minHeight: 16,
  },
  cardAbility: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textAlign: "center",
    minHeight: 14,
  },
  progressWrap: {
    width: "100%",
    gap: 3,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    textAlign: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: "100%",
  },
  actionText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 1,
  },
});
