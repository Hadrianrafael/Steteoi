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

import { JetSvg, JetModel } from "@/components/jets/JetSvg";
import { game } from "@/constants/colors";
import { PLANE_COSTS, useGame, type PlaneTier } from "@/contexts/GameContext";
import { showRewardedAd } from "@/lib/admob";

type JetSpec = {
  tier: PlaneTier;
  model: JetModel;
  name: string;
  country: string;
  ability: string;
  rarity: "Comum" | "Raro" | "Épico" | "Lendário" | "Mítico";
  rarityColor: string;
  accentColor: string;
  speed: number;
  attack: number;
  defense: number;
  description: string;
};

const JETS: JetSpec[] = [
  {
    tier: 1,
    model: "F16",
    name: "F-16 Fighting Falcon",
    country: "🇺🇸 EUA",
    ability: "Manobras evasivas",
    rarity: "Comum",
    rarityColor: "#7E8896",
    accentColor: "#3FD0FF",
    speed: 72,
    attack: 60,
    defense: 55,
    description: "Caça multifuncional compacto. Ágil e confiável em combate.",
  },
  {
    tier: 2,
    model: "F15",
    name: "F-15 Eagle",
    country: "🇺🇸 EUA",
    ability: "Superioridade aérea",
    rarity: "Raro",
    rarityColor: "#3FD0FF",
    accentColor: game.gold,
    speed: 82,
    attack: 75,
    defense: 70,
    description: "O lendário caça de superioridade aérea. Invicto em combate.",
  },
  {
    tier: 3,
    model: "Rafale",
    name: "Rafale F3-R",
    country: "🇫🇷 França",
    ability: "Ataque multifunção",
    rarity: "Épico",
    rarityColor: "#9B5DFF",
    accentColor: game.purple,
    speed: 85,
    attack: 82,
    defense: 78,
    description: "Caça delta-canard francês. Versatilidade em todos os domínios.",
  },
  {
    tier: 4,
    model: "SU57",
    name: "Su-57 Felon",
    country: "🇷🇺 Rússia",
    ability: "Furtividade supersônica",
    rarity: "Lendário",
    rarityColor: "#FFB300",
    accentColor: game.primary,
    speed: 92,
    attack: 90,
    defense: 85,
    description: "5ª geração russa. Manobras impossíveis com motores vetoriais.",
  },
  {
    tier: 5,
    model: "F22",
    name: "F-22 Raptor",
    country: "🇺🇸 EUA",
    ability: "Dominância total",
    rarity: "Mítico",
    rarityColor: "#FF3DBE",
    accentColor: "#FF3DBE",
    speed: 98,
    attack: 97,
    defense: 95,
    description: "O caça stealth mais avançado do mundo. Nenhum inimigo escapa.",
  },
];

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View
          style={[
            styles.statBarFill,
            { width: `${value}%` as `${number}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function PlanesScreen() {
  const { profile, unlockPlane, levelUpPlane, equipPlane, addPlaneShards } =
    useGame();
  const [adLoading, setAdLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlaneTier>(
    profile.planeTier,
  );

  const watchAdForPlane = (tier: PlaneTier, mode: "unlock" | "level") => {
    const key = `${tier}:${mode}`;
    if (adLoading) return;
    setAdLoading(key);
    showRewardedAd({
      onEarned: () => {
        const ok =
          mode === "unlock" ? unlockPlane(tier, true) : levelUpPlane(tier, true);
        if (ok)
          Alert.alert(
            mode === "unlock" ? "Avião desbloqueado!" : "Avião evoluído!",
            "Recompensa do anúncio aplicada.",
          );
        setAdLoading(null);
      },
      onDismissed: () => setAdLoading(null),
    });
  };

  const selectedJet = JETS.find((j) => j.tier === selected)!;
  const selK = String(selected);
  const selShards = profile.planeShards[selK] ?? 0;
  const selLvl = profile.planeLevels[selK] ?? 0;
  const selOwned = selLvl >= 1;
  const selCurrent = profile.planeTier === selected;
  const requiredShards = selOwned ? 5 : 10;
  const shardProgress = Math.min(selShards / requiredShards, 1);
  const unlockCost = PLANE_COSTS[selected];
  const levelCost = Math.round(PLANE_COSTS[selected] * 0.3 * selLvl);
  const canUnlock = !selOwned && selShards >= 10;
  const canLevel = selOwned && selLvl < 10 && selShards >= 5;

  return (
    <View style={styles.root}>
      {/* Header banner */}
      <LinearGradient
        colors={[selectedJet.accentColor + "44", "transparent"]}
        style={styles.banner}
      >
        <Text style={styles.bannerEye}>ARSENAL · EMPIRE CLASH</Text>
        <Text style={styles.bannerTitle}>Frota Aérea</Text>
        <Text style={styles.bannerSub}>
          {JETS.filter((j) => (profile.planeLevels[String(j.tier)] ?? 0) >= 1)
            .length}{" "}
          de {JETS.length} aviões desbloqueados
        </Text>
      </LinearGradient>

      {/* Tier selector tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tierTabs}
      >
        {JETS.map((j) => {
          const lvl = profile.planeLevels[String(j.tier)] ?? 0;
          const owned = lvl >= 1;
          const active = selected === j.tier;
          return (
            <Pressable
              key={j.tier}
              onPress={() => setSelected(j.tier)}
              style={[
                styles.tierTab,
                active && {
                  borderColor: j.accentColor,
                  backgroundColor: j.accentColor + "22",
                },
              ]}
            >
              <View
                style={[
                  styles.tierTabIcon,
                  { opacity: owned ? 1 : 0.45 },
                ]}
              >
                <JetSvg
                  model={j.model}
                  color={active ? j.accentColor : game.muted}
                  size={36}
                />
              </View>
              <Text
                style={[
                  styles.tierTabLabel,
                  active && { color: j.accentColor },
                ]}
                numberOfLines={1}
              >
                {j.name.split(" ")[0]}
              </Text>
              {owned && (
                <View
                  style={[
                    styles.tierOwnedDot,
                    { backgroundColor: j.accentColor },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Main card */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 48 }}
      >
        <View
          style={[
            styles.mainCard,
            { borderColor: selectedJet.accentColor + "66" },
            selCurrent && { borderColor: selectedJet.accentColor },
          ]}
        >
          <LinearGradient
            colors={[selectedJet.accentColor + "28", "transparent"]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Rarity badge */}
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: selectedJet.rarityColor + "33" },
            ]}
          >
            <Text style={[styles.rarityText, { color: selectedJet.rarityColor }]}>
              {selectedJet.rarity.toUpperCase()}
            </Text>
            {selCurrent && (
              <View
                style={[
                  styles.equippedBadge,
                  { backgroundColor: selectedJet.accentColor },
                ]}
              >
                <Text style={styles.equippedText}>EQUIPADO</Text>
              </View>
            )}
          </View>

          {/* Jet SVG — large display */}
          <View style={styles.jetDisplay}>
            <View
              style={[
                styles.jetGlow,
                { backgroundColor: selectedJet.accentColor + "18" },
              ]}
            />
            <JetSvg
              model={selectedJet.model}
              color={selOwned ? selectedJet.accentColor : game.muted}
              size={160}
            />
            {!selOwned && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
          </View>

          {/* Level badge */}
          {selOwned && (
            <View
              style={[
                styles.lvlBadge,
                { borderColor: selectedJet.accentColor },
              ]}
            >
              <Text style={[styles.lvlText, { color: selectedJet.accentColor }]}>
                NV {selLvl}
              </Text>
            </View>
          )}

          {/* Jet info */}
          <Text style={styles.jetName}>{selectedJet.name}</Text>
          <View style={styles.jetMeta}>
            <Text style={styles.jetCountry}>{selectedJet.country}</Text>
            <Text style={styles.jetAbility}>· {selectedJet.ability}</Text>
          </View>
          <Text style={styles.jetDesc}>{selectedJet.description}</Text>

          {/* Stats */}
          <View style={styles.statsBox}>
            <StatBar
              label="VELOC."
              value={selectedJet.speed}
              color={game.gem}
            />
            <StatBar
              label="ATAQUE"
              value={selectedJet.attack}
              color={game.primary}
            />
            <StatBar
              label="DEFESA"
              value={selectedJet.defense}
              color={game.success}
            />
          </View>

          {/* Shard progress */}
          <Pressable
            onPress={() => addPlaneShards(selected, 1)}
            style={styles.shardWrap}
          >
            <View style={styles.shardHeader}>
              <Text style={styles.shardLabel}>Figurinhas</Text>
              <Text style={[styles.shardCount, { color: selectedJet.accentColor }]}>
                {selShards} / {requiredShards}
              </Text>
            </View>
            <View style={styles.shardBarBg}>
              <LinearGradient
                colors={[selectedJet.accentColor, selectedJet.accentColor + "AA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.shardBarFill,
                  { width: `${shardProgress * 100}%` as `${number}%` },
                ]}
              />
            </View>
            <Text style={styles.shardHint}>
              {selOwned
                ? "5 figurinhas para evoluir"
                : "10 figurinhas para desbloquear"}
            </Text>
          </Pressable>

          {/* Action buttons */}
          <View style={styles.actions}>
            {!selOwned ? (
              canUnlock ? (
                profile.coins >= unlockCost ? (
                  <Pressable
                    onPress={() => {
                      if (!unlockPlane(selected)) {
                        Alert.alert("Erro", "Sem moedas suficientes.");
                      }
                    }}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: selectedJet.accentColor, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Text style={styles.actionBtnText}>
                      🪙 {unlockCost.toLocaleString("pt-BR")} — DESBLOQUEAR
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => watchAdForPlane(selected, "unlock")}
                    disabled={!!adLoading}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.adBtn,
                      {
                        opacity:
                          adLoading === `${selected}:unlock`
                            ? 0.7
                            : pressed
                            ? 0.85
                            : 1,
                      },
                    ]}
                  >
                    {adLoading === `${selected}:unlock` ? (
                      <ActivityIndicator size="small" color={game.text} />
                    ) : (
                      <Text style={styles.actionBtnText}>
                        ▶ VER VÍDEO — DESBLOQUEAR GRÁTIS
                      </Text>
                    )}
                  </Pressable>
                )
              ) : (
                <View style={[styles.actionBtn, styles.lockedBtn]}>
                  <Text style={[styles.actionBtnText, { color: game.muted }]}>
                    🔒 COLETE {10 - selShards} FIGURINHAS PARA DESBLOQUEAR
                  </Text>
                </View>
              )
            ) : selCurrent ? (
              selLvl < 10 ? (
                canLevel ? (
                  profile.coins >= levelCost ? (
                    <Pressable
                      onPress={() => {
                        if (!levelUpPlane(selected))
                          Alert.alert("Erro", "Sem moedas suficientes.");
                      }}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: game.gold, opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <Text style={[styles.actionBtnText, { color: game.bgDeep }]}>
                        🪙 {levelCost.toLocaleString("pt-BR")} — EVOLUIR NV {selLvl + 1}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => watchAdForPlane(selected, "level")}
                      disabled={!!adLoading}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.adBtn,
                        {
                          opacity:
                            adLoading === `${selected}:level`
                              ? 0.7
                              : pressed
                              ? 0.85
                              : 1,
                        },
                      ]}
                    >
                      {adLoading === `${selected}:level` ? (
                        <ActivityIndicator size="small" color={game.text} />
                      ) : (
                        <Text style={styles.actionBtnText}>
                          ▶ VER VÍDEO — EVOLUIR GRÁTIS
                        </Text>
                      )}
                    </Pressable>
                  )
                ) : (
                  <View
                    style={[
                      styles.actionBtn,
                      { backgroundColor: selectedJet.accentColor + "44" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: selectedJet.accentColor },
                      ]}
                    >
                      ✓ EQUIPADO — COLETE FIGURINHAS PARA EVOLUIR
                    </Text>
                  </View>
                )
              ) : (
                <View style={[styles.actionBtn, { backgroundColor: game.gold }]}>
                  <Text style={[styles.actionBtnText, { color: game.bgDeep }]}>
                    ★ NÍVEL MÁXIMO
                  </Text>
                </View>
              )
            ) : (
              <Pressable
                onPress={() => {
                  if (!equipPlane(selected))
                    Alert.alert(
                      "Erro",
                      "Desbloqueie o avião primeiro.",
                    );
                }}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: selectedJet.accentColor,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={styles.actionBtnText}>⚡ EQUIPAR</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Coming soon: Gripen */}
        <View style={styles.comingCard}>
          <LinearGradient
            colors={["#22C55E22", "transparent"]}
            style={StyleSheet.absoluteFillObject}
          />
          <JetSvg model="Gripen" color={game.muted} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.comingTitle}>JAS-39 Gripen NG</Text>
            <Text style={styles.comingDesc}>
              🇸🇪 Suécia · Caça delta-canard compacto
            </Text>
          </View>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>EM BREVE</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  banner: {
    padding: 18,
    paddingBottom: 14,
    gap: 2,
  },
  bannerEye: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 2.5,
  },
  bannerTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 24,
  },
  bannerSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  tierTabs: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
    flexDirection: "row",
  },
  tierTab: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: game.border,
    gap: 4,
    minWidth: 70,
  },
  tierTabIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tierTabLabel: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tierOwnedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: game.border,
    backgroundColor: game.surface,
    padding: 18,
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  rarityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rarityText: {
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 1.5,
    flex: 1,
  },
  equippedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  equippedText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1,
  },
  jetDisplay: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  jetGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  lockOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    fontSize: 40,
  },
  lvlBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: game.bgDeep,
  },
  lvlText: {
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 1,
  },
  jetName: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 1,
  },
  jetMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jetCountry: {
    color: game.textDim,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  jetAbility: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  jetDesc: {
    color: game.textDim,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  statsBox: {
    width: "100%",
    gap: 8,
    backgroundColor: game.bgDeep,
    borderRadius: 14,
    padding: 14,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.8,
    width: 52,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: game.surfaceElevated,
    borderRadius: 4,
    overflow: "hidden",
  },
  statBarFill: {
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontFamily: "Inter_900Black",
    fontSize: 12,
    width: 28,
    textAlign: "right",
  },
  shardWrap: {
    width: "100%",
    gap: 6,
    padding: 12,
    backgroundColor: game.bgDeep,
    borderRadius: 14,
  },
  shardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shardLabel: {
    color: game.textDim,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  shardCount: {
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  shardBarBg: {
    height: 10,
    backgroundColor: game.surfaceElevated,
    borderRadius: 5,
    overflow: "hidden",
  },
  shardBarFill: {
    height: 10,
    borderRadius: 5,
  },
  shardHint: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  actions: { width: "100%", gap: 8 },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  adBtn: { backgroundColor: game.success },
  lockedBtn: { backgroundColor: game.surfaceElevated },
  actionBtnText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  comingCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#22C55E33",
    backgroundColor: game.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },
  comingTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  comingDesc: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  comingSoon: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#22C55E22",
    borderWidth: 1,
    borderColor: "#22C55E55",
  },
  comingSoonText: {
    color: "#22C55E",
    fontFamily: "Inter_900Black",
    fontSize: 10,
    letterSpacing: 1,
  },
});
