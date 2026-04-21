import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

type Tab = "destaques" | "moedas" | "gemas" | "aviões" | "skins" | "ads";

type CoinPack = {
  id: string;
  amount: number;
  bonus: number;
  price: string;
  badge?: string;
  color: string;
  size: "sm" | "md" | "lg" | "xl";
};

const COIN_PACKS: CoinPack[] = [
  { id: "c1", amount: 500, bonus: 0, price: "R$ 4,90", color: game.gold, size: "sm" },
  { id: "c2", amount: 1500, bonus: 100, price: "R$ 9,90", color: game.gold, size: "md", badge: "+100" },
  { id: "c3", amount: 5000, bonus: 800, price: "R$ 24,90", color: game.gold, size: "lg", badge: "POPULAR" },
  { id: "c4", amount: 15000, bonus: 4000, price: "R$ 74,90", color: game.gold, size: "xl", badge: "MELHOR" },
];

const GEM_PACKS: CoinPack[] = [
  { id: "g1", amount: 30, bonus: 0, price: "R$ 4,90", color: game.gem, size: "sm" },
  { id: "g2", amount: 90, bonus: 10, price: "R$ 9,90", color: game.gem, size: "md", badge: "+10" },
  { id: "g3", amount: 300, bonus: 50, price: "R$ 24,90", color: game.gem, size: "lg", badge: "POPULAR" },
  { id: "g4", amount: 1000, bonus: 250, price: "R$ 74,90", color: game.gem, size: "xl", badge: "MELHOR" },
];

const SKINS = [
  { id: "classic", name: "Clássico", cost: 0, currency: "coins" as const, color: game.primary, icon: "shield-alt" as const },
  { id: "imperial", name: "Imperial", cost: 800, currency: "coins" as const, color: game.gold, icon: "crown" as const },
  { id: "neon", name: "Neon", cost: 50, currency: "gems" as const, color: game.gem, icon: "bolt" as const },
  { id: "shadow", name: "Sombra", cost: 80, currency: "gems" as const, color: game.purple, icon: "ghost" as const },
  { id: "blood", name: "Sangue", cost: 1500, currency: "coins" as const, color: game.danger, icon: "fire" as const },
  { id: "verde", name: "Esmeralda", cost: 60, currency: "gems" as const, color: game.success, icon: "leaf" as const },
];

const REWARDED_ADS = [
  { id: "ad-coins", label: "Moedas", reward: 200, type: "coins" as const, icon: "coins" as const, color: game.gold },
  { id: "ad-gems", label: "Gemas", reward: 5, type: "gems" as const, icon: "gem" as const, color: game.gem },
  { id: "ad-energy", label: "Energia", reward: 2, type: "energy" as const, icon: "bolt" as const, color: game.energy },
];

const BOOSTERS = [
  { id: "b1", name: "Boost Tropas 2x", desc: "Dobra a produção por 1 partida", cost: 80, icon: "users" as const, color: game.success },
  { id: "b2", name: "Energia Cheia", desc: "Recarrega energia ao máximo", cost: 30, icon: "bolt" as const, color: game.energy },
  { id: "b3", name: "Pacote Combate", desc: "+3 bombas e +3 escudos", cost: 120, icon: "fist-raised" as const, color: game.danger },
];

export default function ShopScreen() {
  const router = useRouter();
  const {
    profile,
    addCoins,
    addGems,
    refillEnergy,
    spendCoins,
    spendGems,
    buySkin,
    selectSkin,
    activateVip,
    buySkill,
  } = useGame();
  const [tab, setTab] = useState<Tab>("destaques");
  const [adShowing, setAdShowing] = useState<(typeof REWARDED_ADS)[number] | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const adAnim = useRef(new Animated.Value(0)).current;

  // Featured banner pulse
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 1100,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
  }, [pulse]);

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
      if (a.type === "energy") refillEnergy();
      setAdShowing(null);
    });
    const id = setInterval(() => {
      const v = (adAnim as unknown as { _value: number })._value ?? 0;
      setAdProgress(v);
    }, 100);
    return () => clearInterval(id);
  }, [adShowing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePremium = (label: string, price: string) => {
    Alert.alert(
      "Compra premium",
      `${label} (${price}) requer pagamento real. Liberado na build da Play Store.`,
    );
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

  const handleBooster = (b: (typeof BOOSTERS)[number]) => {
    if (!spendGems(b.cost)) {
      Alert.alert("Gemas insuficientes");
      return;
    }
    if (b.id === "b2") refillEnergy();
    if (b.id === "b3") {
      buySkill("skillNuke", 0);
      buySkill("skillNuke", 0);
      buySkill("skillNuke", 0);
      buySkill("skillShield", 0);
      buySkill("skillShield", 0);
      buySkill("skillShield", 0);
      // Reset gems removed since we already spent them; manually add the items
      addGems(0);
    }
    Alert.alert("Booster ativo!", b.name);
  };

  return (
    <View style={styles.root}>
      {/* Wallet */}
      <View style={styles.wallet}>
        <View style={styles.walletPill}>
          <FontAwesome5 name="coins" size={12} color={game.gold} />
          <Text style={styles.walletText}>{profile.coins.toLocaleString("pt-BR")}</Text>
        </View>
        <View style={styles.walletPill}>
          <FontAwesome5 name="gem" size={12} color={game.gem} />
          <Text style={styles.walletText}>{profile.gems}</Text>
        </View>
        <View style={styles.walletPill}>
          <FontAwesome5 name="bolt" size={12} color={game.energy} />
          <Text style={styles.walletText}>
            {profile.energy}/{profile.maxEnergy}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {(
          [
            ["destaques", "🔥 Destaques"],
            ["moedas", "🪙 Moedas"],
            ["gemas", "💎 Gemas"],
            ["aviões", "✈️ Aviões"],
            ["skins", "🎨 Skins"],
            ["ads", "🎁 Grátis"],
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
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}>
        {tab === "destaques" && (
          <>
            {/* VIP / Featured Pass banner */}
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Passe VIP",
                    "Energia máxima dobrada + 50% mais XP. Aceita ativar a versão demo?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Ativar demo",
                        onPress: () => {
                          activateVip();
                          Alert.alert("VIP ativo!");
                        },
                      },
                    ],
                  )
                }
              >
                <LinearGradient
                  colors={[game.purple, game.primary, game.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroBanner}
                >
                  <View style={styles.heroLeft}>
                    <View style={styles.heroBadge}>
                      <Text style={styles.heroBadgeText}>EXCLUSIVO</Text>
                    </View>
                    <Text style={styles.heroTitle}>PASSE VIP</Text>
                    <Text style={styles.heroSub}>
                      Energia ×2 · XP +50% · Sem anúncios
                    </Text>
                    <View style={styles.heroPriceRow}>
                      <Text style={styles.heroPriceOld}>R$ 39,90</Text>
                      <Text style={styles.heroPrice}>R$ 19,90</Text>
                    </View>
                  </View>
                  <View style={styles.heroIcon}>
                    <FontAwesome5 name="crown" size={56} color={game.gold} />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Starter Pack */}
            <Pressable
              onPress={() => {
                addCoins(1000);
                addGems(10);
                Alert.alert("Resgatado!", "1.000 moedas + 10 gemas");
              }}
            >
              <LinearGradient
                colors={[game.success + "55", game.surface]}
                style={styles.starterCard}
              >
                <View style={styles.starterIcon}>
                  <FontAwesome5 name="gift" size={32} color={game.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.starterTitleRow}>
                    <Text style={styles.starterTitle}>Pacote Iniciante</Text>
                    <View style={[styles.tag, { backgroundColor: game.success }]}>
                      <Text style={styles.tagText}>GRÁTIS</Text>
                    </View>
                  </View>
                  <Text style={styles.starterDesc}>
                    1.000 moedas + 10 gemas — 1× por conta
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={16} color={game.text} />
              </LinearGradient>
            </Pressable>

            {/* Daily Deals */}
            <Text style={styles.sectionTitle}>OFERTAS DO DIA</Text>
            <View style={styles.dealRow}>
              <DealCard
                title="Combo Guerra"
                desc="2.000 moedas + 50 gemas"
                price="R$ 14,90"
                color={game.danger}
                icon="bomb"
                onPress={() => handlePremium("Combo Guerra", "R$ 14,90")}
              />
              <DealCard
                title="Combo Frota"
                desc="Drone + 100 gemas"
                price="R$ 29,90"
                color={game.gem}
                icon="rocket"
                onPress={() => handlePremium("Combo Frota", "R$ 29,90")}
              />
            </View>

            {/* Boosters */}
            <Text style={styles.sectionTitle}>BOOSTERS</Text>
            {BOOSTERS.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => handleBooster(b)}
                style={({ pressed }) => [
                  styles.boosterCard,
                  { borderColor: b.color + "55", opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.boosterIcon, { backgroundColor: b.color + "33" }]}>
                  <FontAwesome5 name={b.icon} size={22} color={b.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boosterTitle}>{b.name}</Text>
                  <Text style={styles.boosterDesc}>{b.desc}</Text>
                </View>
                <View style={styles.boosterPrice}>
                  <FontAwesome5 name="gem" size={11} color={game.gem} />
                  <Text style={styles.boosterPriceText}>{b.cost}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {tab === "moedas" && (
          <View style={styles.packGrid}>
            {COIN_PACKS.map((p) => (
              <PackCard
                key={p.id}
                pack={p}
                icon="coins"
                onPress={() => handlePremium(`${p.amount} moedas`, p.price)}
              />
            ))}
          </View>
        )}

        {tab === "gemas" && (
          <View style={styles.packGrid}>
            {GEM_PACKS.map((p) => (
              <PackCard
                key={p.id}
                pack={p}
                icon="gem"
                onPress={() => handlePremium(`${p.amount} gemas`, p.price)}
              />
            ))}
          </View>
        )}

        {tab === "aviões" && (
          <>
            <View style={styles.infoBanner}>
              <FontAwesome5 name="plane" size={18} color={game.gem} />
              <Text style={styles.infoBannerText}>
                Compre frotas com moedas para acelerar ataques de longa distância
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/planes")}
              style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={[game.gem, "#3FA3FF"]}
                style={styles.ctaInner}
              >
                <FontAwesome5 name="paper-plane" size={20} color={game.text} />
                <Text style={styles.ctaText}>VER FROTA AÉREA</Text>
                <FontAwesome5 name="chevron-right" size={14} color={game.text} />
              </LinearGradient>
            </Pressable>

            <Text style={styles.sectionTitle}>SUPER FROTAS</Text>
            {[
              { name: "Esquadrão Elite", desc: "5 aviões Tier 3 simultâneos", price: "R$ 19,90", color: game.gold },
              { name: "Frota Imperial", desc: "Aviões dourados com efeito visual", price: "R$ 29,90", color: game.purple },
            ].map((s) => (
              <Pressable
                key={s.name}
                onPress={() => handlePremium(s.name, s.price)}
                style={({ pressed }) => [
                  styles.boosterCard,
                  { borderColor: s.color + "55", opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.boosterIcon, { backgroundColor: s.color + "33" }]}>
                  <FontAwesome5 name="fighter-jet" size={22} color={s.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boosterTitle}>{s.name}</Text>
                  <Text style={styles.boosterDesc}>{s.desc}</Text>
                </View>
                <View style={[styles.priceTag, { backgroundColor: s.color }]}>
                  <Text style={styles.priceTagText}>{s.price}</Text>
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
                    selected && { borderColor: game.gold, borderWidth: 2 },
                  ]}
                >
                  <LinearGradient
                    colors={[s.color + "55", "transparent"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={[styles.skinSwatch, { backgroundColor: s.color }]}>
                    <FontAwesome5 name={s.icon} size={32} color={game.text} />
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

        {tab === "ads" && (
          <>
            <View style={styles.infoBanner}>
              <FontAwesome5 name="play-circle" size={18} color={game.gold} />
              <Text style={styles.infoBannerText}>
                Assista um anúncio curto e ganhe recompensa grátis
              </Text>
            </View>
            {REWARDED_ADS.map((ad) => (
              <Pressable
                key={ad.id}
                onPress={() => setAdShowing(ad)}
                style={({ pressed }) => [
                  styles.adCard,
                  { borderColor: ad.color + "55", opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.boosterIcon, { backgroundColor: ad.color + "33" }]}>
                  <FontAwesome5 name="play" size={22} color={ad.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boosterTitle}>Anúncio Premiado</Text>
                  <Text style={styles.boosterDesc}>
                    Ganhe {ad.reward} {ad.label.toLowerCase()}
                  </Text>
                </View>
                <View style={[styles.adReward, { backgroundColor: ad.color + "33" }]}>
                  <FontAwesome5 name={ad.icon} size={11} color={ad.color} />
                  <Text style={[styles.adRewardText, { color: ad.color }]}>
                    +{ad.reward}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
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
                AdMob real ativo na build da Play Store
              </Text>
            </View>
            <View style={styles.adProgressBar}>
              <View
                style={[styles.adProgressFill, { width: `${adProgress * 100}%` }]}
              />
            </View>
            <Text style={styles.adWait}>
              {adShowing
                ? `Aguarde ${Math.max(0, Math.ceil(4 - adProgress * 4))}s`
                : ""}
            </Text>
            <Pressable onPress={() => setAdShowing(null)} style={styles.adClose}>
              <Text style={styles.adCloseText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PackCard({
  pack,
  icon,
  onPress,
}: {
  pack: CoinPack;
  icon: keyof typeof FontAwesome5.glyphMap;
  onPress: () => void;
}) {
  const sizeMap = {
    sm: { iconSize: 28, count: 1 },
    md: { iconSize: 36, count: 2 },
    lg: { iconSize: 44, count: 3 },
    xl: { iconSize: 56, count: 4 },
  };
  const cfg = sizeMap[pack.size];
  return (
    <Pressable onPress={onPress} style={styles.packCardWrap}>
      <LinearGradient
        colors={[pack.color + "44", game.surface]}
        style={[
          styles.packCard,
          pack.size === "xl" && { borderColor: pack.color, borderWidth: 2 },
        ]}
      >
        {pack.badge && (
          <View style={[styles.packBadge, { backgroundColor: pack.color }]}>
            <Text style={styles.packBadgeText}>{pack.badge}</Text>
          </View>
        )}
        <View style={styles.packIconStack}>
          {Array.from({ length: cfg.count }).map((_, i) => (
            <FontAwesome5
              key={i}
              name={icon}
              size={cfg.iconSize}
              color={pack.color}
              style={{
                marginLeft: i === 0 ? 0 : -cfg.iconSize * 0.5,
                marginTop: i * 4,
                opacity: 0.85 + i * 0.05,
              }}
            />
          ))}
        </View>
        <Text style={styles.packAmount}>
          {pack.amount.toLocaleString("pt-BR")}
        </Text>
        {pack.bonus > 0 && (
          <Text style={[styles.packBonus, { color: pack.color }]}>
            + {pack.bonus} bônus
          </Text>
        )}
        <View style={styles.packPrice}>
          <Text style={styles.packPriceText}>{pack.price}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function DealCard({
  title,
  desc,
  price,
  color,
  icon,
  onPress,
}: {
  title: string;
  desc: string;
  price: string;
  color: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dealCard}>
      <LinearGradient
        colors={[color + "44", game.surface]}
        style={styles.dealInner}
      >
        <View style={styles.dealTimerBadge}>
          <FontAwesome5 name="clock" size={9} color={game.gold} />
          <Text style={styles.dealTimerText}>23h</Text>
        </View>
        <FontAwesome5 name={icon} size={36} color={color} />
        <Text style={styles.dealTitle}>{title}</Text>
        <Text style={styles.dealDesc}>{desc}</Text>
        <View style={[styles.dealPrice, { backgroundColor: color }]}>
          <Text style={styles.dealPriceText}>{price}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  wallet: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: game.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: game.border,
  },
  walletText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  tabs: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: game.surface,
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
  },
  tabTextActive: { color: game.gold },

  heroBanner: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 22,
    alignItems: "center",
    minHeight: 130,
    overflow: "hidden",
  },
  heroLeft: { flex: 1, gap: 4 },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#000000AA",
    marginBottom: 4,
  },
  heroBadgeText: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1,
  },
  heroTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 28,
    letterSpacing: 2,
  },
  heroSub: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    opacity: 0.9,
  },
  heroPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6,
  },
  heroPriceOld: {
    color: game.text,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  heroPrice: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
  },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#000000AA",
    alignItems: "center",
    justifyContent: "center",
  },

  starterCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: game.success + "55",
  },
  starterIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: game.success + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  starterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starterTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  starterDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  tagText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
  },

  sectionTitle: {
    color: game.textDim,
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 4,
  },

  dealRow: {
    flexDirection: "row",
    gap: 10,
  },
  dealCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  dealInner: {
    padding: 12,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: game.border,
    borderRadius: 16,
    minHeight: 170,
  },
  dealTimerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: game.bgDeep,
    alignSelf: "flex-end",
  },
  dealTimerText: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 9,
  },
  dealTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
    textAlign: "center",
  },
  dealDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textAlign: "center",
  },
  dealPrice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  dealPriceText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 12,
  },

  boosterCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1.5,
  },
  boosterIcon: {
    width: 50,
    height: 50,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  boosterTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  boosterDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  boosterPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: game.bgDeep,
  },
  boosterPriceText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  priceTag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  priceTagText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },

  packGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  packCardWrap: {
    width: "48%",
  },
  packCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: game.border,
    alignItems: "center",
    gap: 6,
    minHeight: 200,
    overflow: "hidden",
  },
  packBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  packBadgeText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  packIconStack: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 70,
    marginTop: 8,
  },
  packAmount: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    marginTop: 6,
  },
  packBonus: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  packPrice: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: game.gold,
    borderRadius: 10,
  },
  packPriceText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: game.gold + "15",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: game.gold + "44",
  },
  infoBannerText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    flex: 1,
  },

  cta: { borderRadius: 14, overflow: "hidden" },
  ctaInner: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  ctaText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 14,
    letterSpacing: 1.2,
  },

  skinGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skinCard: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  skinSwatch: {
    width: 84,
    height: 84,
    borderRadius: 18,
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

  adCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1.5,
  },
  adReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adRewardText: {
    fontFamily: "Inter_900Black",
    fontSize: 13,
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
