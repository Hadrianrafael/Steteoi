import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
};

const HEROES: Hero[] = [
  { tier: 1, name: "Caça Padrão", ability: "Velocidade base", rarity: "Comum", rarityColor: "#7E8896", color: "#3FD0FF", icon: "paper-plane" },
  { tier: 2, name: "Bombardeiro", ability: "+25% velocidade", rarity: "Raro", rarityColor: "#3FD0FF", color: game.gold, icon: "fighter-jet" },
  { tier: 3, name: "Caça Stealth", ability: "Invisível ao radar", rarity: "Épico", rarityColor: "#9B5DFF", color: game.purple, icon: "plane" },
  { tier: 4, name: "Drone Hipersônico", ability: "Velocidade extrema", rarity: "Lendário", rarityColor: "#FFB300", color: game.primary, icon: "rocket" },
  { tier: 5, name: "Frota Imperial", ability: "Aura intimidadora", rarity: "Mítico", rarityColor: "#FF3DBE", color: game.gold, icon: "crown" },
];

export default function PlanesScreen() {
  const { profile, unlockPlane, levelUpPlane, equipPlane, addPlaneShards } = useGame();
  const [adFor, setAdFor] = useState<{ tier: PlaneTier; mode: "unlock" | "level" } | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const adAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!adFor) return;
    setAdProgress(0);
    adAnim.setValue(0);
    Animated.timing(adAnim, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished || !adFor) return;
      const ok =
        adFor.mode === "unlock"
          ? unlockPlane(adFor.tier, true)
          : levelUpPlane(adFor.tier, true);
      if (ok) {
        Alert.alert(
          adFor.mode === "unlock" ? "Avião desbloqueado!" : "Avião melhorado!",
          "Recompensa do anúncio aplicada.",
        );
      }
      setAdFor(null);
    });
    const id = setInterval(() => {
      const v = (adAnim as unknown as { _value: number })._value ?? 0;
      setAdProgress(v);
    }, 100);
    return () => clearInterval(id);
  }, [adFor]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnlock = (h: Hero) => {
    if (unlockPlane(h.tier)) return;
    Alert.alert("Sem moedas", `Custa ${PLANE_COSTS[h.tier].toLocaleString("pt-BR")} moedas. Assista um vídeo para liberar grátis.`);
  };

  const handleLevelUp = (h: Hero) => {
    const lvl = profile.planeLevels[String(h.tier)] ?? 0;
    const cost = Math.round(PLANE_COSTS[h.tier] * 0.3 * lvl);
    if (levelUpPlane(h.tier)) return;
    Alert.alert("Sem moedas", `Custa ${cost.toLocaleString("pt-BR")} moedas. Assista um vídeo para upgrade grátis.`);
  };

  // Test helper: tap shard count to add 1 (simulates collecting from gameplay rewards)
  const debugAddShard = (tier: PlaneTier) => {
    addPlaneShards(tier, 1);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}
    >
      <LinearGradient colors={[game.gem + "55", game.surface]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>ARSENAL · COLEÇÃO</Text>
        <Text style={styles.heroTitle}>Aviões</Text>
        <Text style={styles.heroSub}>
          Colete figurinhas para desbloquear novos aviões
        </Text>
      </LinearGradient>

      <View style={styles.legendBox}>
        <Text style={styles.legendText}>
          <Text style={{ fontFamily: "Inter_900Black", color: game.gold }}>10 figurinhas</Text> para desbloquear · <Text style={{ fontFamily: "Inter_900Black", color: game.gold }}>5 figurinhas</Text> para evoluir
        </Text>
      </View>

      <View style={styles.grid}>
        {HEROES.map((h) => {
          const k = String(h.tier);
          const shards = profile.planeShards[k] ?? 0;
          const lvl = profile.planeLevels[k] ?? 0;
          const owned = lvl >= 1;
          const isCurrent = profile.planeTier === h.tier;
          const required = owned ? 5 : 10;
          const progress = Math.min(shards / required, 1);
          const canUnlock = !owned && shards >= 10;
          const canLevelUp = owned && lvl < 10 && shards >= 5;
          const cost = owned
            ? Math.round(PLANE_COSTS[h.tier] * 0.3 * lvl)
            : PLANE_COSTS[h.tier];

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
                {!owned ? (
                  <FontAwesome5 name="lock" size={36} color={game.muted} />
                ) : (
                  <FontAwesome5 name={h.icon} size={42} color={h.color} />
                )}
              </View>

              {/* Level badge */}
              {owned && (
                <View style={styles.lvlBadge}>
                  <Text style={styles.lvlBadgeText}>NV {lvl}</Text>
                </View>
              )}

              {/* Name */}
              <Text style={[styles.cardName, !owned && { color: game.muted }]}>
                {!owned ? "AINDA NÃO DESBLOQUEADO" : h.name}
              </Text>
              <Text style={styles.cardAbility}>
                {!owned ? "Colete figurinhas" : h.ability}
              </Text>

              {/* Shard progress */}
              <Pressable onPress={() => debugAddShard(h.tier)} style={styles.progressWrap}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%`, backgroundColor: h.color },
                    ]}
                  />
                </View>
                <View style={styles.shardRow}>
                  <FontAwesome5 name="puzzle-piece" size={9} color={game.gold} />
                  <Text style={styles.progressText}>
                    {shards} / {required}
                  </Text>
                </View>
              </Pressable>

              {/* Action */}
              {!owned ? (
                canUnlock ? (
                  profile.coins >= cost ? (
                    <Pressable
                      onPress={() => handleUnlock(h)}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: h.color, opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <FontAwesome5 name="coins" size={11} color={game.text} />
                      <Text style={styles.actionText}>{cost.toLocaleString("pt-BR")}</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => setAdFor({ tier: h.tier, mode: "unlock" })}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.adAction,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <FontAwesome5 name="play" size={11} color={game.text} />
                      <Text style={styles.actionText}>VER VÍDEO</Text>
                    </Pressable>
                  )
                ) : (
                  <View style={[styles.actionBtn, { backgroundColor: game.surfaceElevated, opacity: 0.55 }]}>
                    <FontAwesome5 name="lock" size={11} color={game.muted} />
                    <Text style={[styles.actionText, { color: game.muted }]}>BLOQUEADO</Text>
                  </View>
                )
              ) : isCurrent ? (
                lvl < 10 ? (
                  canLevelUp ? (
                    profile.coins >= cost ? (
                      <Pressable
                        onPress={() => handleLevelUp(h)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          { backgroundColor: game.gold, opacity: pressed ? 0.85 : 1 },
                        ]}
                      >
                        <FontAwesome5 name="coins" size={11} color={game.bgDeep} />
                        <Text style={[styles.actionText, { color: game.bgDeep }]}>
                          {cost.toLocaleString("pt-BR")}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => setAdFor({ tier: h.tier, mode: "level" })}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.adAction,
                          { opacity: pressed ? 0.85 : 1 },
                        ]}
                      >
                        <FontAwesome5 name="play" size={11} color={game.text} />
                        <Text style={styles.actionText}>VER VÍDEO</Text>
                      </Pressable>
                    )
                  ) : (
                    <View style={[styles.actionBtn, { backgroundColor: game.gold + "44" }]}>
                      <FontAwesome5 name="check" size={11} color={game.gold} />
                      <Text style={[styles.actionText, { color: game.gold }]}>EQUIPADO</Text>
                    </View>
                  )
                ) : (
                  <View style={[styles.actionBtn, { backgroundColor: game.gold }]}>
                    <Text style={[styles.actionText, { color: game.bgDeep }]}>NV MAX</Text>
                  </View>
                )
              ) : (
                <Pressable
                  onPress={() => equipPlane(h.tier)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: game.surfaceElevated, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.actionText}>EQUIPAR</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <Modal visible={!!adFor} transparent animationType="fade">
        <View style={styles.adModal}>
          <View style={styles.adBox}>
            <Text style={styles.adTitle}>ANÚNCIO PATROCINADO</Text>
            <View style={styles.adVideo}>
              <FontAwesome5 name="ad" size={64} color={game.gold} />
              <Text style={styles.adVideoText}>Empire Clash</Text>
              <Text style={styles.adVideoSubtext}>
                {adFor?.mode === "unlock" ? "Desbloqueio grátis após o vídeo" : "Upgrade grátis após o vídeo"}
              </Text>
            </View>
            <View style={styles.adProgressBar}>
              <View style={[styles.adProgressFill, { width: `${adProgress * 100}%` }]} />
            </View>
            <Text style={styles.adWait}>
              {adFor ? `Aguarde ${Math.max(0, Math.ceil(4 - adProgress * 4))}s` : ""}
            </Text>
            <Pressable onPress={() => setAdFor(null)} style={styles.adClose}>
              <Text style={styles.adCloseText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  heroTitle: { color: game.text, fontFamily: "Inter_900Black", fontSize: 22 },
  heroSub: { color: game.textDim, fontFamily: "Inter_500Medium", fontSize: 12 },
  legendBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: game.gold + "11",
    borderWidth: 1,
    borderColor: game.gold + "33",
  },
  legendText: { color: game.text, fontFamily: "Inter_500Medium", fontSize: 11, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
  rarityText: { color: game.text, fontFamily: "Inter_900Black", fontSize: 9, letterSpacing: 1.5 },
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
  lvlBadgeText: { color: game.gold, fontFamily: "Inter_900Black", fontSize: 10 },
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
  progressWrap: { width: "100%", gap: 3 },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: game.bgDeep,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4 },
  shardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  progressText: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: "100%",
  },
  adAction: { backgroundColor: game.success },
  actionText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 1,
  },
  adModal: {
    flex: 1,
    backgroundColor: "#000A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  adBox: {
    backgroundColor: game.surface,
    borderRadius: 18,
    padding: 18,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: game.border,
  },
  adTitle: { color: game.gold, fontFamily: "Inter_900Black", fontSize: 12, letterSpacing: 2 },
  adVideo: {
    width: "100%",
    height: 180,
    backgroundColor: game.bgDeep,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  adVideoText: { color: game.text, fontFamily: "Inter_900Black", fontSize: 18 },
  adVideoSubtext: { color: game.textDim, fontFamily: "Inter_500Medium", fontSize: 10 },
  adProgressBar: {
    width: "100%",
    height: 6,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    overflow: "hidden",
  },
  adProgressFill: { height: 6, backgroundColor: game.gold },
  adWait: { color: game.textDim, fontFamily: "Inter_500Medium", fontSize: 11 },
  adClose: { paddingHorizontal: 18, paddingVertical: 8 },
  adCloseText: { color: game.textDim, fontFamily: "Inter_700Bold", fontSize: 12 },
});
