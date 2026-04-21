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
  icon: keyof typeof FontAwesome5.glyphMap;
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
    icon: "gift",
  },
  {
    id: "energy",
    title: "Energia Cheia",
    desc: "Recarrega energia para batalhar",
    cost: 30,
    currency: "gems",
    reward: { energy: 5 },
    color: game.energy,
    icon: "bolt",
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
    icon: "box-open",
  },
  {
    id: "gem-pack",
    title: "Pacote de Gemas",
    desc: "200 gemas premium",
    cost: 1500,
    currency: "coins",
    reward: { gems: 200 },
    color: game.gem,
    icon: "gem",
  },
  {
    id: "vip",
    title: "Passe VIP",
    desc: "Energia máxima dobrada permanentemente",
    cost: 4999,
    currency: "real",
    reward: {},
    badge: "VIP",
    color: game.purple,
    icon: "crown",
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

const REWARDED_ADS = [
  { id: "ad-coins", label: "Moedas", reward: 200, type: "coins" as const, icon: "coins" as const, color: game.gold },
  { id: "ad-gems", label: "Gemas", reward: 5, type: "gems" as const, icon: "gem" as const, color: game.gem },
  { id: "ad-energy", label: "Energia", reward: 2, type: "energy" as const, icon: "bolt" as const, color: game.energy },
];

export default function ShopScreen() {
  const {
    profile,
    addCoins,
    addGems,
    refillEnergy,
    addEnergy,
    spendCoins,
    spendGems,
    buySkin,
    selectSkin,
    activateVip,
  } = useGame();
  const [tab, setTab] = useState<"packs" | "skins" | "ads">("packs");
  const [adShowing, setAdShowing] = useState<(typeof REWARDED_ADS)[number] | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const adAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!adShowing) return;
    setAdProgress(0);
    adAnim.setValue(0);
    Animated.timing(adAnim, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished || !adShowing) return;
      const a = adShowing;
      if (a.type === "coins") addCoins(a.reward);
      if (a.type === "gems") addGems(a.reward);
      if (a.type === "energy") addEnergy(a.reward);
      setAdShowing(null);
    });
    const id = setInterval(() => {
      const v = (adAnim as unknown as { _value: number })._value ?? 0;
      setAdProgress(v);
    }, 100);
    return () => clearInterval(id);
  }, [adShowing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuy = (pack: Pack) => {
    if (pack.currency === "real") {
      if (pack.cost === 0) {
        if (pack.reward.coins) addCoins(pack.reward.coins);
        if (pack.reward.gems) addGems(pack.reward.gems);
        Alert.alert("Recompensado", `${pack.title} resgatado!`);
        return;
      }
      if (pack.id === "vip") {
        Alert.alert(
          "Passe VIP",
          "Compra real necessária. Aceita ativar a versão demo?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Ativar demo",
              onPress: () => {
                activateVip();
                Alert.alert("VIP ativo!", "Energia máxima dobrada.");
              },
            },
          ],
        );
        return;
      }
      Alert.alert(
        "Compra premium",
        `${pack.title} requer compra real (R$ ${(pack.cost / 100).toFixed(2)}).`,
      );
      return;
    }
    const ok =
      pack.currency === "coins" ? spendCoins(pack.cost) : spendGems(pack.cost);
    if (!ok) {
      Alert.alert("Saldo insuficiente");
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
    if (!buySkin(s.id, s.cost, s.currency)) {
      Alert.alert("Saldo insuficiente");
      return;
    }
    selectSkin(s.id);
  };

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        {(
          [
            ["packs", "PACOTES"],
            ["ads", "ANÚNCIOS"],
            ["skins", "SKINS"],
          ] as const
        ).map(([t, label]) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {label}
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
                <View
                  style={[styles.packIcon, { backgroundColor: p.color + "22" }]}
                >
                  <FontAwesome5 name={p.icon} size={26} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.packTitleRow}>
                    <Text style={styles.packTitle}>{p.title}</Text>
                    {p.badge && (
                      <View style={[styles.badge, { backgroundColor: p.color }]}>
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

        {tab === "ads" && (
          <>
            <View style={styles.adInfo}>
              <FontAwesome5 name="play-circle" size={18} color={game.gold} />
              <Text style={styles.adInfoText}>
                Assista um anúncio curto e receba a recompensa
              </Text>
            </View>
            {REWARDED_ADS.map((ad) => (
              <Pressable
                key={ad.id}
                onPress={() => setAdShowing(ad)}
                style={({ pressed }) => [
                  styles.adCard,
                  { borderColor: ad.color + "55", opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <View style={[styles.packIcon, { backgroundColor: ad.color + "22" }]}>
                  <FontAwesome5 name="play" size={22} color={ad.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.packTitle}>Anúncio Premiado</Text>
                  <Text style={styles.packDesc}>
                    Ganhe {ad.reward} {ad.label.toLowerCase()}
                  </Text>
                </View>
                <View style={[styles.adReward, { backgroundColor: ad.color + "22" }]}>
                  <FontAwesome5 name={ad.icon} size={11} color={ad.color} />
                  <Text style={[styles.priceText, { color: ad.color }]}>
                    +{ad.reward}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

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
                          { color: selected ? game.bgDeep : game.text },
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

      <Modal visible={!!adShowing} transparent animationType="fade">
        <View style={styles.adModal}>
          <View style={styles.adBox}>
            <Text style={styles.adTitle}>ANÚNCIO PATROCINADO</Text>
            <View style={styles.adVideo}>
              <FontAwesome5 name="ad" size={64} color={game.gold} />
              <Text style={styles.adVideoText}>Empire Clash</Text>
              <Text style={styles.adVideoSubtext}>
                Anúncios reais via AdMob na versão Play Store
              </Text>
            </View>
            <View style={styles.adProgressBar}>
              <View
                style={[
                  styles.adProgressFill,
                  { width: `${adProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.adWait}>
              {adShowing
                ? `Aguarde ${Math.max(0, Math.ceil(4 - adProgress * 4))}s para receber recompensa`
                : ""}
            </Text>
            <Pressable
              onPress={() => setAdShowing(null)}
              style={styles.adClose}
            >
              <Text style={styles.adCloseText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 8,
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
    fontSize: 11,
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
  adInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: game.gold + "15",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: game.gold + "44",
  },
  adInfoText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    flex: 1,
  },
  adCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
  },
  adReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
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
  adModal: {
    flex: 1,
    backgroundColor: "#000000DD",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  adBox: {
    width: "100%",
    maxWidth: 360,
    padding: 18,
    backgroundColor: game.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: game.border,
    gap: 14,
  },
  adTitle: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
    textAlign: "center",
  },
  adVideo: {
    height: 180,
    borderRadius: 14,
    backgroundColor: game.bgDeep,
    borderWidth: 1,
    borderColor: game.gold + "55",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 16,
  },
  adVideoText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    letterSpacing: 2,
  },
  adVideoSubtext: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textAlign: "center",
  },
  adProgressBar: {
    height: 6,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    overflow: "hidden",
  },
  adProgressFill: {
    height: "100%",
    backgroundColor: game.gold,
  },
  adWait: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
  },
  adClose: {
    paddingVertical: 10,
    alignItems: "center",
  },
  adCloseText: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
});
