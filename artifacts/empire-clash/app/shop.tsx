import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

type Pack = {
  id: string;
  title: string;
  desc: string;
  cost: number;
  currency: "coins" | "gems" | "real";
  reward: { coins?: number; gems?: number; energy?: number };
  badge?: string;
  color: string;
};

const PACKS: Pack[] = [
  {
    id: "starter",
    title: "Pacote Iniciante",
    desc: "1.000 moedas + 10 gemas",
    cost: 0,
    currency: "real",
    reward: { coins: 1000, gems: 10 },
    badge: "GRÁTIS",
    color: game.success,
  },
  {
    id: "energy",
    title: "Energia Cheia",
    desc: "Recarrega energia para batalhar",
    cost: 30,
    currency: "gems",
    reward: { energy: 5 },
    color: game.energy,
  },
  {
    id: "gold-chest",
    title: "Baú Dourado",
    desc: "5.000 moedas",
    cost: 100,
    currency: "gems",
    reward: { coins: 5000 },
    badge: "POPULAR",
    color: game.gold,
  },
  {
    id: "gem-pack",
    title: "Pacote de Gemas",
    desc: "200 gemas premium",
    cost: 1500,
    currency: "coins",
    reward: { gems: 200 },
    color: game.gem,
  },
  {
    id: "warlord",
    title: "Bundle Comandante",
    desc: "10k moedas + 500 gemas + skin",
    cost: 4999,
    currency: "real",
    reward: { coins: 10000, gems: 500 },
    badge: "MELHOR VALOR",
    color: game.primary,
  },
];

const SKINS = [
  { id: "classic", name: "Clássico", cost: 0, currency: "coins" as const, color: game.primary },
  { id: "imperial", name: "Imperial", cost: 800, currency: "coins" as const, color: game.gold },
  { id: "neon", name: "Neon", cost: 50, currency: "gems" as const, color: game.gem },
  { id: "shadow", name: "Sombra", cost: 80, currency: "gems" as const, color: game.purple },
  { id: "blood", name: "Sangue", cost: 1500, currency: "coins" as const, color: game.danger },
  { id: "verde", name: "Esmeralda", cost: 60, currency: "gems" as const, color: game.success },
];

export default function ShopScreen() {
  const { profile, addCoins, addGems, refillEnergy, spendCoins, spendGems, buySkin, selectSkin } =
    useGame();
  const [tab, setTab] = useState<"packs" | "skins">("packs");

  const handleBuy = (pack: Pack) => {
    if (pack.currency === "real") {
      // Mocked free claim or premium prompt
      if (pack.cost === 0) {
        if (pack.reward.coins) addCoins(pack.reward.coins);
        if (pack.reward.gems) addGems(pack.reward.gems);
        Alert.alert("Recompensado", `${pack.title} resgatado!`);
        return;
      }
      Alert.alert(
        "Compra premium",
        `${pack.title} requer compra real. Conecte seu método de pagamento na próxima atualização.`,
      );
      return;
    }
    const ok =
      pack.currency === "coins"
        ? spendCoins(pack.cost)
        : spendGems(pack.cost);
    if (!ok) {
      Alert.alert("Saldo insuficiente", "Adquira mais moedas ou gemas.");
      return;
    }
    if (pack.reward.coins) addCoins(pack.reward.coins);
    if (pack.reward.gems) addGems(pack.reward.gems);
    if (pack.reward.energy) refillEnergy();
    Alert.alert("Sucesso!", `${pack.title} adquirido.`);
  };

  const handleSkin = (s: (typeof SKINS)[number]) => {
    if (profile.ownedSkins.includes(s.id)) {
      selectSkin(s.id);
      return;
    }
    const ok = buySkin(s.id, s.cost, s.currency);
    if (!ok) {
      Alert.alert("Saldo insuficiente");
      return;
    }
    selectSkin(s.id);
  };

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        {(["packs", "skins"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === t && styles.tabTextActive]}
            >
              {t === "packs" ? "PACOTES" : "SKINS"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
        {tab === "packs" &&
          PACKS.map((p) => (
            <Pressable key={p.id} onPress={() => handleBuy(p)}>
              <LinearGradient
                colors={[game.surfaceElevated, game.surface]}
                style={[styles.packCard, { borderColor: p.color + "55" }]}
              >
                <View style={[styles.packIcon, { backgroundColor: p.color + "22" }]}>
                  <FontAwesome5
                    name={
                      p.id === "energy"
                        ? "bolt"
                        : p.id === "starter"
                          ? "gift"
                          : p.id === "gem-pack"
                            ? "gem"
                            : p.id === "warlord"
                              ? "crown"
                              : "box-open"
                    }
                    size={26}
                    color={p.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.packTitleRow}>
                    <Text style={styles.packTitle}>{p.title}</Text>
                    {p.badge && (
                      <View
                        style={[styles.badge, { backgroundColor: p.color }]}
                      >
                        <Text style={styles.badgeText}>{p.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.packDesc}>{p.desc}</Text>
                </View>
                <View style={styles.priceTag}>
                  {p.currency === "real" ? (
                    <Text style={styles.priceText}>
                      {p.cost === 0
                        ? "GRÁTIS"
                        : `R$ ${(p.cost / 100).toFixed(2)}`}
                    </Text>
                  ) : (
                    <View style={styles.priceRow}>
                      <FontAwesome5
                        name={p.currency === "gems" ? "gem" : "coins"}
                        size={11}
                        color={p.currency === "gems" ? game.gem : game.gold}
                      />
                      <Text style={styles.priceText}>{p.cost}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Pressable>
          ))}

        {tab === "skins" && (
          <View style={styles.skinGrid}>
            {SKINS.map((s) => {
              const owned = profile.ownedSkins.includes(s.id);
              const selected = profile.selectedSkin === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => handleSkin(s)}
                  style={[
                    styles.skinCard,
                    selected && { borderColor: game.gold },
                  ]}
                >
                  <View
                    style={[styles.skinSwatch, { backgroundColor: s.color }]}
                  >
                    <FontAwesome5 name="shield-alt" size={28} color={game.text} />
                  </View>
                  <Text style={styles.skinName}>{s.name}</Text>
                  {owned ? (
                    <View
                      style={[
                        styles.skinAction,
                        {
                          backgroundColor: selected
                            ? game.gold
                            : game.surfaceElevated,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.skinActionText,
                          {
                            color: selected ? game.bgDeep : game.text,
                          },
                        ]}
                      >
                        {selected ? "EQUIPADO" : "USAR"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.skinPrice}>
                      <FontAwesome5
                        name={s.currency === "gems" ? "gem" : "coins"}
                        size={10}
                        color={s.currency === "gems" ? game.gem : game.gold}
                      />
                      <Text style={styles.skinPriceText}>{s.cost}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: game.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  tabActive: {
    backgroundColor: game.gold + "22",
    borderColor: game.gold,
  },
  tabText: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  tabTextActive: { color: game.gold },
  packCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  packIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  packTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  packTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  packDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: game.bgDeep,
    borderRadius: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  priceText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  skinGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skinCard: {
    width: "48%",
    padding: 12,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    borderColor: game.border,
    alignItems: "center",
    gap: 8,
  },
  skinSwatch: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  skinName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  skinAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  skinActionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  skinPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: game.bgDeep,
  },
  skinPriceText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
