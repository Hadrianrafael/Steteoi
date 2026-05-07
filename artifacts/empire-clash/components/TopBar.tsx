import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { haptic } from "@/services/haptics";

function AnimatedPill({
  icon,
  value,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  value: number;
  color: string;
  onPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.18,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [value, scaleAnim]);

  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      hitSlop={6}
    >
      <Animated.View
        style={[
          styles.pill,
          { borderColor: color + "55", transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.pillIcon}>{icon}</View>
        <Text style={styles.pillValue}>{value.toLocaleString("pt-BR")}</Text>
        <View style={[styles.pillPlus, { backgroundColor: color }]}>
          <Feather name="plus" size={10} color="#fff" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function TopBar({ onSettings }: { onSettings?: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile } = useGame();
  const router = useRouter();

  const energyPct = profile.energy / profile.maxEnergy;
  const energyColor =
    energyPct >= 0.6
      ? game.energy
      : energyPct >= 0.3
        ? game.gold
        : game.danger;

  return (
    <LinearGradient
      colors={[game.bgDeep + "F8", game.bgDeep + "CC", game.bg + "00"]}
      style={[styles.wrap, { paddingTop: insets.top + 6 }]}
    >
      <View style={styles.row}>
        {/* Settings */}
        <Pressable
          onPress={() => {
            haptic.tap();
            onSettings ? onSettings() : router.push("/settings");
          }}
          style={styles.settingsBtn}
          hitSlop={10}
        >
          <Feather name="settings" size={20} color={game.text} />
        </Pressable>

        {/* Resource pills */}
        <View style={styles.pills}>
          <AnimatedPill
            icon={<FontAwesome5 name="coins" size={11} color={game.gold} />}
            value={profile.coins}
            color={game.gold}
            onPress={() => router.push("/shop")}
          />
          <AnimatedPill
            icon={<FontAwesome5 name="gem" size={11} color={game.gem} />}
            value={profile.gems}
            color={game.gem}
            onPress={() => router.push("/shop")}
          />
          {/* Energy pill — special with bar */}
          <Pressable hitSlop={6} style={[styles.pill, styles.energyPill, { borderColor: energyColor + "55" }]}>
            <View style={styles.pillIcon}>
              <FontAwesome5 name="bolt" size={11} color={energyColor} />
            </View>
            <View style={styles.energyStack}>
              <Text style={[styles.pillValue, { color: energyColor }]}>
                {profile.energy}
              </Text>
              <View style={styles.energyBarBg}>
                <LinearGradient
                  colors={[energyColor, energyColor + "88"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.energyBarFill,
                    { width: `${energyPct * 100}%` as `${number}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.energyMax, { color: energyColor + "88" }]}>
              /{profile.maxEnergy}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: game.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  pills: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: game.surface,
    borderRadius: 14,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 5,
    height: 30,
  },
  energyPill: {
    paddingRight: 8,
    height: 34,
    paddingVertical: 5,
  },
  pillIcon: {
    width: 16,
    alignItems: "center",
  },
  pillValue: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    minWidth: 20,
  },
  pillPlus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  energyStack: {
    gap: 3,
    justifyContent: "center",
  },
  energyBarBg: {
    width: 36,
    height: 3,
    backgroundColor: game.surfaceElevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  energyBarFill: {
    height: 3,
    borderRadius: 2,
  },
  energyMax: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    lineHeight: 12,
  },
});
