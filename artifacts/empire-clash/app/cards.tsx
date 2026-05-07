import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";
import {
  CARD_DEFS,
  CardColor,
  CardDef,
  useGame,
} from "@/contexts/GameContext";

const RARITY_ORDER = ["legendary", "epic", "rare", "uncommon", "common"] as const;

const RARITY_COLORS: Record<string, string> = {
  legendary: "#FFD700",
  epic:      "#A855F7",
  rare:      "#3B82F6",
  uncommon:  "#22C55E",
  common:    "#94A3B8",
};

const RARITY_LABELS: Record<string, string> = {
  legendary: "Lendária",
  epic:      "Épica",
  rare:      "Rara",
  uncommon:  "Incomum",
  common:    "Comum",
};

const COLOR_LABELS: Record<CardColor, string> = {
  blue:   "Azul",
  red:    "Vermelha",
  yellow: "Amarela",
};

const COLOR_HEX: Record<CardColor, string> = {
  blue:   "#3B82F6",
  red:    "#EF4444",
  yellow: "#EAB308",
};

type FilterColor = CardColor | "all";

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useGame();
  const [filter, setFilter] = useState<FilterColor>("all");

  const filters: { key: FilterColor; label: string; color: string }[] = [
    { key: "all", label: "Todas", color: game.gold },
    { key: "blue", label: "Azul", color: COLOR_HEX.blue },
    { key: "red", label: "Vermelha", color: COLOR_HEX.red },
    { key: "yellow", label: "Amarela", color: COLOR_HEX.yellow },
  ];

  const sortedDefs = [...CARD_DEFS].sort((a, b) => {
    const ri = RARITY_ORDER.indexOf(a.rarity as typeof RARITY_ORDER[number]);
    const rj = RARITY_ORDER.indexOf(b.rarity as typeof RARITY_ORDER[number]);
    if (ri !== rj) return ri - rj;
    return a.color.localeCompare(b.color);
  });

  const visible = sortedDefs.filter(
    (c) => filter === "all" || c.color === filter,
  );

  const totalCards = sortedDefs.reduce(
    (s, c) => s + (profile.cards[c.id] ?? 0),
    0,
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[game.bgDeep, game.bg]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <FontAwesome5 name="layer-group" size={22} color="#A78BFA" />
        <Text style={styles.title}>ARSENAL DE CARTAS</Text>
        <View style={styles.countChip}>
          <Text style={styles.countText}>{totalCards}</Text>
        </View>
      </View>

      {/* Color filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map(({ key, label, color }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterChip,
                active && { backgroundColor: color + "33", borderColor: color },
              ]}
            >
              <Text
                style={[styles.filterText, active && { color }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {visible.map((def) => {
          const qty = profile.cards[def.id] ?? 0;
          return <CardItem key={def.id} def={def} qty={qty} />;
        })}
      </ScrollView>
    </View>
  );
}

function CardItem({ def, qty }: { def: CardDef; qty: number }) {
  const rarityColor = RARITY_COLORS[def.rarity];
  const cardColor = COLOR_HEX[def.color];
  const locked = qty === 0;

  return (
    <View
      style={[
        styles.card,
        locked && { opacity: 0.45 },
        { borderColor: rarityColor + "66" },
      ]}
    >
      {/* Top glow band */}
      <LinearGradient
        colors={[cardColor + "55", "transparent"]}
        style={styles.cardGlow}
      />

      {/* Rarity badge */}
      <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "33" }]}>
        <Text style={[styles.rarityText, { color: rarityColor }]}>
          {RARITY_LABELS[def.rarity]}
        </Text>
      </View>

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: cardColor + "22" }]}>
        <FontAwesome5
          name={
            def.color === "blue"
              ? "star"
              : def.color === "red"
                ? "fire"
                : "coins"
          }
          size={30}
          color={locked ? game.muted : cardColor}
        />
        {def.rarity === "legendary" && !locked && (
          <View style={styles.legendaryGlow} />
        )}
      </View>

      <Text style={styles.cardName} numberOfLines={2}>
        {def.name}
      </Text>
      <Text style={styles.cardBonus} numberOfLines={1}>
        {def.bonus}
      </Text>

      {/* Color tag */}
      <View style={[styles.colorTag, { backgroundColor: cardColor + "22" }]}>
        <View style={[styles.colorDot, { backgroundColor: cardColor }]} />
        <Text style={[styles.colorTagText, { color: cardColor }]}>
          {COLOR_LABELS[def.color]}
        </Text>
      </View>

      {/* Quantity */}
      <View style={styles.qtyWrap}>
        {locked ? (
          <FontAwesome5 name="lock" size={13} color={game.muted} />
        ) : (
          <>
            <FontAwesome5 name="layer-group" size={12} color={rarityColor} />
            <Text style={[styles.qtyText, { color: rarityColor }]}>×{qty}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
    letterSpacing: 2,
    flex: 1,
  },
  countChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#A78BFA33",
    borderWidth: 1,
    borderColor: "#A78BFA55",
  },
  countText: {
    color: "#A78BFA",
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: game.border,
  },
  filterText: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  grid: {
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: game.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
    overflow: "hidden",
    position: "relative",
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    height: 60,
  },
  rarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rarityText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  legendaryGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD70033",
  },
  cardName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    textAlign: "center",
  },
  cardBonus: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textAlign: "center",
  },
  colorTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  colorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  colorTagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  qtyWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 2,
  },
  qtyText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
});
