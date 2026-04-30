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

const COIN_PACKS = [
  { id: "c1", amount: 500, bonus: 0, price: "R$ 4,90", size: "sm" as const },
  { id: "c2", amount: 1500, bonus: 100, price: "R$ 9,90", size: "md" as const, badge: "+100" },
  { id: "c3", amount: 5000, bonus: 800, price: "R$ 24,90", size: "lg" as const, badge: "POPULAR" },
  { id: "c4", amount: 15000, bonus: 4000, price: "R$ 74,90", size: "xl" as const, badge: "MELHOR" },
];

const GEM_PACKS = [
  { id: "g1", amount: 30, bonus: 0, price: "R$ 4,90", size: "sm" as const },
  { id: "g2", amount: 90, bonus: 10, price: "R$ 9,90", size: "md" as const, badge: "+10" },
  { id: "g3", amount: 300, bonus: 50, price: "R$ 24,90", size: "lg" as const, badge: "POPULAR" },
  { id: "g4", amount: 1000, bonus: 250, price: "R$ 74,90", size: "xl" as const, badge: "MELHOR" },
];

const BOOSTERS = [
  { id: "b1", name: "Boost Tropas 2x", desc: "Dobra a produção por 1 partida", cost: 80, stars: 1, icon: "users" as const, color: "#3FD0FF" },
  { id: "b2", name: "Energia Cheia", desc: "Recarrega energia ao máximo", cost: 30, stars: 2, icon: "bolt" as const, color: "#FF6AC1" },
  { id: "b3", name: "Pacote Combate", desc: "+3 bombas e +3 escudos", cost: 120, stars: 3, icon: "fist-raised" as const, color: "#FF8E2E" },
];

const REWARDED_ADS = [
  { id: "ad-coins", label: "200 Moedas", reward: 200, type: "coins" as const, icon: "coins" as const, color: game.gold },
  { id: "ad-gems", label: "5 Gemas", reward: 5, type: "gems" as const, icon: "gem" as const, color: game.gem },
  { id: "ad-energy", label: "Recarregar Energia", reward: 30, type: "energy" as const, icon: "bolt" as const, color: game.energy },
];

function useDailyTimer() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  const ms = tomorrow.getTime() - now;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ShopScreen() {
  const {
    profile,
    addCoins,
    addGems,
    refillEnergy,
    spendGems,
    activateVip,
    buySkill,
  } = useGame();
  const [adShowing, setAdShowing] = useState<(typeof REWARDED_ADS)[number] | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [starterClaimed, setStarterClaimed] = useState(false);
  const adAnim = useRef(new Animated.Value(0)).current;
  const dailyTime = useDailyTimer();

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

  const handleBooster = (b: (typeof BOOSTERS)[number]) => {
    if (!spendGems(b.cost)) {
      Alert.alert("Gemas insuficientes", "Assista um anúncio para ganhar gemas grátis.");
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
    }
    Alert.alert("Booster ativo!", b.name);
  };

  const claimStarter = () => {
    if (starterClaimed) return;
    addCoins(1000);
    addGems(20);
    setStarterClaimed(true);
    Alert.alert("Resgatado!", "1.000 moedas + 20 gemas");
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

      <ScrollView contentContainerStyle={{ padding: 14, gap: 18, paddingBottom: 40 }}>
        {/* SECTION: Starter Pack */}
        <View>
          <Text style={styles.sectionTitle}>PACK INICIANTE</Text>
          <LinearGradient
            colors={[game.purple + "55", game.gold + "33", game.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.starterMega}
          >
            <View style={styles.starterMegaHeader}>
              <View style={[styles.starBadge, { backgroundColor: game.gold }]}>
                <FontAwesome5 name="crown" size={11} color={game.bgDeep} />
                <Text style={styles.starBadgeText}>OFERTA ÚNICA</Text>
              </View>
              <Text style={styles.starterMegaTitle}>BEM-VINDO COMANDANTE</Text>
              <Text style={styles.starterMegaSub}>Pacote completo para começar</Text>
            </View>

            <View style={styles.starterItems}>
              <StarterItem icon="gem" amount="50" label="Gemas" color={game.gem} />
              <StarterItem icon="coins" amount="2.000" label="Moedas" color={game.gold} />
              <StarterItem icon="bolt" amount="3" label="Boosters" color={game.energy} />
              <StarterItem icon="bomb" amount="3" label="Bombas" color={game.danger} />
            </View>

            <View style={styles.starterActions}>
              <Pressable
                onPress={() => handlePremium("Pack Iniciante", "R$ 9,90")}
                style={({ pressed }) => [styles.priceBtn, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={styles.pricePixed}>R$ 9,90</Text>
              </Pressable>
              <Pressable
                disabled={starterClaimed}
                onPress={claimStarter}
                style={({ pressed }) => [
                  styles.adBtn,
                  starterClaimed && { opacity: 0.4 },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <FontAwesome5 name="play" size={11} color={game.text} />
                <Text style={styles.adBtnText}>
                  {starterClaimed ? "RESGATADO" : "GRÁTIS"}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* VIP banner */}
        <Pressable
          onPress={() =>
            Alert.alert(
              "Passe VIP",
              "Energia máxima 60 + 50% mais XP. Aceita ativar a versão demo?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Ativar demo", onPress: () => { activateVip(); Alert.alert("VIP ativo!"); } },
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
              <Text style={styles.heroSub}>Energia ×2 · XP +50% · Sem ads</Text>
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

        {/* SECTION: Boosters */}
        <View>
          <Text style={styles.sectionTitle}>BOOSTERS</Text>
          <View style={styles.boosterGrid}>
            {BOOSTERS.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => handleBooster(b)}
                style={({ pressed }) => [
                  styles.boosterCard,
                  { borderColor: b.color, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <LinearGradient
                  colors={[b.color + "33", "transparent"]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.starsRow}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <FontAwesome5
                      key={i}
                      name="star"
                      size={9}
                      color={i < b.stars ? game.gold : game.muted}
                      solid={i < b.stars}
                    />
                  ))}
                </View>
                <View style={[styles.boosterIconBig, { backgroundColor: b.color + "44" }]}>
                  <FontAwesome5 name={b.icon} size={28} color={b.color} />
                </View>
                <Text style={styles.boosterName}>{b.name}</Text>
                <Text style={styles.boosterDescSm}>{b.desc}</Text>
                <View style={[styles.priceChip, { backgroundColor: b.color }]}>
                  <FontAwesome5 name="gem" size={10} color={game.text} />
                  <Text style={styles.priceChipText}>{b.cost}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* SECTION: Daily Deals */}
        <View>
          <View style={styles.dailyHeader}>
            <Text style={styles.sectionTitle}>OFERTAS DIÁRIAS</Text>
            <View style={styles.timerPill}>
              <FontAwesome5 name="clock" size={10} color={game.gold} />
              <Text style={styles.timerText}>{dailyTime}</Text>
            </View>
          </View>
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
        </View>

        {/* SECTION: Diamonds (Gemas) */}
        <View>
          <View style={styles.dailyHeader}>
            <Text style={styles.sectionTitle}>DIAMANTES</Text>
            <Pressable
              onPress={() => setAdShowing(REWARDED_ADS[1]!)}
              style={styles.freePill}
            >
              <FontAwesome5 name="play" size={9} color={game.gem} />
              <Text style={[styles.freePillText, { color: game.gem }]}>GRÁTIS</Text>
            </Pressable>
          </View>
          <View style={styles.packGrid}>
            {GEM_PACKS.map((p) => (
              <PackCard
                key={p.id}
                amount={p.amount}
                bonus={p.bonus}
                price={p.price}
                badge={p.badge}
                size={p.size}
                color={game.gem}
                icon="gem"
                onPress={() => handlePremium(`${p.amount} gemas`, p.price)}
              />
            ))}
          </View>
        </View>

        {/* SECTION: Coins (Moedas) */}
        <View>
          <View style={styles.dailyHeader}>
            <Text style={styles.sectionTitle}>MOEDAS</Text>
            <Pressable
              onPress={() => setAdShowing(REWARDED_ADS[0]!)}
              style={styles.freePill}
            >
              <FontAwesome5 name="play" size={9} color={game.gold} />
              <Text style={[styles.freePillText, { color: game.gold }]}>GRÁTIS</Text>
            </Pressable>
          </View>
          <View style={styles.packGrid}>
            {COIN_PACKS.map((p) => (
              <PackCard
                key={p.id}
                amount={p.amount}
                bonus={p.bonus}
                price={p.price}
                badge={p.badge}
                size={p.size}
                color={game.gold}
                icon="coins"
                onPress={() => handlePremium(`${p.amount} moedas`, p.price)}
              />
            ))}
          </View>
        </View>

        {/* SECTION: Free Rewards */}
        <View>
          <Text style={styles.sectionTitle}>RECOMPENSAS GRÁTIS</Text>
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
                <FontAwesome5 name={ad.icon} size={22} color={ad.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.boosterTitle}>{ad.label}</Text>
                <Text style={styles.boosterDesc}>Assista um vídeo curto</Text>
              </View>
              <View style={[styles.watchBtn, { backgroundColor: ad.color }]}>
                <FontAwesome5 name="play" size={11} color={game.text} />
                <Text style={styles.watchBtnText}>VER</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Ad modal */}
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

function StarterItem({
  icon,
  amount,
  label,
  color,
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  amount: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.starterItem}>
      <View style={[styles.starterItemIcon, { backgroundColor: color + "33" }]}>
        <FontAwesome5 name={icon} size={18} color={color} />
      </View>
      <Text style={styles.starterItemAmount}>{amount}</Text>
      <Text style={styles.starterItemLabel}>{label}</Text>
    </View>
  );
}

function PackCard({
  amount,
  bonus,
  price,
  badge,
  size,
  color,
  icon,
  onPress,
}: {
  amount: number;
  bonus: number;
  price: string;
  badge?: string;
  size: "sm" | "md" | "lg" | "xl";
  color: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  onPress: () => void;
}) {
  const sizeMap = {
    sm: { iconSize: 28, count: 1 },
    md: { iconSize: 36, count: 2 },
    lg: { iconSize: 44, count: 3 },
    xl: { iconSize: 56, count: 4 },
  };
  const cfg = sizeMap[size];
  return (
    <Pressable onPress={onPress} style={styles.packCardWrap}>
      <LinearGradient
        colors={[color + "44", game.surface]}
        style={[
          styles.packCard,
          size === "xl" && { borderColor: color, borderWidth: 2 },
        ]}
      >
        {badge && (
          <View style={[styles.packBadge, { backgroundColor: color }]}>
            <Text style={styles.packBadgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.packIconStack}>
          {Array.from({ length: cfg.count }).map((_, i) => (
            <FontAwesome5
              key={i}
              name={icon}
              size={cfg.iconSize}
              color={color}
              style={{
                marginLeft: i === 0 ? 0 : -cfg.iconSize * 0.5,
                marginTop: i * 4,
                opacity: 0.85 + i * 0.05,
              }}
            />
          ))}
        </View>
        <Text style={styles.packAmount}>
          {amount.toLocaleString("pt-BR")}
        </Text>
        {bonus > 0 && (
          <Text style={[styles.packBonus, { color }]}>+ {bonus} bônus</Text>
        )}
        <View style={styles.packPrice}>
          <Text style={styles.packPriceText}>{price}</Text>
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
        <View style={[styles.dealIcon, { backgroundColor: color + "33" }]}>
          <FontAwesome5 name={icon} size={26} color={color} />
        </View>
        <Text style={styles.dealTitle}>{title}</Text>
        <Text style={styles.dealDesc}>{desc}</Text>
        <View style={[styles.priceChip, { backgroundColor: color, marginTop: 4 }]}>
          <Text style={styles.priceChipText}>{price}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  wallet: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: "center",
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
  },
  walletText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  sectionTitle: {
    color: game.textDim,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  starterMega: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: game.gold + "77",
    gap: 10,
  },
  starterMegaHeader: { gap: 4 },
  starBadge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starBadgeText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1,
  },
  starterMegaTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
    letterSpacing: 1,
  },
  starterMegaSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  starterItems: {
    flexDirection: "row",
    gap: 6,
  },
  starterItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    padding: 8,
    backgroundColor: game.bgDeep + "AA",
    borderRadius: 10,
  },
  starterItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  starterItemAmount: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  starterItemLabel: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 9,
  },
  starterActions: {
    flexDirection: "row",
    gap: 8,
  },
  priceBtn: {
    flex: 1,
    backgroundColor: game.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  pricePixed: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
  adBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: game.success,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  adBtnText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
  heroBanner: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 18,
    gap: 10,
    overflow: "hidden",
  },
  heroLeft: { flex: 1, gap: 4 },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: game.bgDeep + "AA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    letterSpacing: 1.5,
  },
  heroSub: {
    color: game.text,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  heroPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6,
  },
  heroPriceOld: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  heroPrice: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 18,
  },
  heroIcon: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  boosterGrid: {
    flexDirection: "row",
    gap: 8,
  },
  boosterCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: game.surface,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    gap: 6,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  boosterIconBig: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  boosterName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    textAlign: "center",
  },
  boosterDescSm: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    textAlign: "center",
    minHeight: 22,
  },
  priceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceChipText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },
  dailyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: game.gold + "22",
    marginBottom: 8,
  },
  timerText: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  freePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.border,
    marginBottom: 8,
  },
  freePillText: {
    fontFamily: "Inter_900Black",
    fontSize: 9,
    letterSpacing: 1,
  },
  dealRow: { flexDirection: "row", gap: 10 },
  dealCard: { flex: 1, borderRadius: 14, overflow: "hidden" },
  dealInner: { padding: 12, alignItems: "center", gap: 4 },
  dealIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dealTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  dealDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textAlign: "center",
  },
  packGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  packCardWrap: { width: "47%" },
  packCard: {
    padding: 12,
    borderRadius: 16,
    minHeight: 160,
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  packBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  packBadgeText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 9,
  },
  packIconStack: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
  },
  packAmount: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
  },
  packBonus: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  packPrice: {
    backgroundColor: game.bgDeep + "AA",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 4,
  },
  packPriceText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 12,
  },
  adCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  boosterIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  boosterTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  boosterDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  watchBtnText: {
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
  adTitle: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 2,
  },
  adVideo: {
    width: "100%",
    height: 180,
    backgroundColor: game.bgDeep,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  adVideoText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
  },
  adVideoSubtext: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  adProgressBar: {
    width: "100%",
    height: 6,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    overflow: "hidden",
  },
  adProgressFill: {
    height: 6,
    backgroundColor: game.gold,
  },
  adWait: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  adClose: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  adCloseText: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
