import { FontAwesome5 } from "@expo/vector-icons";
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
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value;
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 90, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 130, useNativeDriver: true }),
      ]).start();
    }
  }, [value, scale]);

  return (
    <Pressable onPress={() => { haptic.tap(); onPress?.(); }} hitSlop={8}>
      <Animated.View style={[styles.pill, { borderColor: color + "40", transform: [{ scale }] }]}>
        <View style={styles.pillIcon}>{icon}</View>
        <Text style={styles.pillValue}>{value.toLocaleString("pt-BR")}</Text>
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
    energyPct >= 0.5 ? game.energy : energyPct >= 0.25 ? game.gold : game.danger;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 4 }]}>
      {/* Left — brand logo */}
      <Pressable
        onPress={() => { haptic.tap(); onSettings ? onSettings() : router.push("/settings"); }}
        hitSlop={10}
      >
        <LinearGradient
          colors={[game.gold, game.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Text style={styles.logoText}>EC</Text>
        </LinearGradient>
      </Pressable>

      {/* Right — resources */}
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

        {/* Energy — pill with mini bar */}
        <View style={[styles.pill, styles.energyPill, { borderColor: energyColor + "40" }]}>
          <FontAwesome5 name="bolt" size={11} color={energyColor} />
          <View style={styles.energyBody}>
            <Text style={[styles.pillValue, { color: energyColor }]}>
              {profile.energy}<Text style={[styles.energyMax, { color: energyColor + "70" }]}>/{profile.maxEnergy}</Text>
            </Text>
            <View style={styles.energyTrack}>
              <LinearGradient
                colors={[energyColor, energyColor + "60"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.energyFill, { width: `${Math.max(2, energyPct * 100)}%` as `${number}%` }]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: game.bgDeep,
    borderBottomWidth: 1,
    borderBottomColor: game.border + "80",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 1,
  },
  pills: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: game.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    gap: 5,
    height: 32,
  },
  pillIcon: {
    width: 14,
    alignItems: "center",
  },
  pillValue: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  energyPill: {
    paddingHorizontal: 9,
    gap: 6,
  },
  energyBody: {
    gap: 2,
  },
  energyMax: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  energyTrack: {
    width: 34,
    height: 3,
    backgroundColor: game.surfaceElevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  energyFill: {
    height: 3,
    borderRadius: 2,
  },
});
