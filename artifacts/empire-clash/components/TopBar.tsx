import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

function Pill({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.pill, { borderColor: color + "55" }]}>
      <View style={styles.pillIcon}>{icon}</View>
      <Text style={styles.pillValue}>{value}</Text>
      <View style={[styles.pillPlus, { backgroundColor: color }]}>
        <Feather name="plus" size={11} color="#fff" />
      </View>
    </View>
  );
}

export function TopBar({ onSettings }: { onSettings?: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile } = useGame();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[game.bgDeep, game.bg + "00"]}
      style={[styles.wrap, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={() =>
            onSettings ? onSettings() : router.push("/settings")
          }
          style={styles.settingsBtn}
          hitSlop={10}
        >
          <Feather name="settings" size={20} color={game.text} />
        </Pressable>

        <View style={styles.pills}>
          <Pill
            icon={<FontAwesome5 name="coins" size={11} color={game.gold} />}
            value={profile.coins}
            color={game.gold}
          />
          <Pill
            icon={<FontAwesome5 name="gem" size={11} color={game.gem} />}
            value={profile.gems}
            color={game.gem}
          />
          <Pill
            icon={<FontAwesome5 name="bolt" size={11} color={game.energy} />}
            value={profile.energy}
            color={game.energy}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingBottom: 10,
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
    gap: 8,
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
    gap: 6,
    height: 30,
  },
  pillIcon: {
    width: 16,
    alignItems: "center",
  },
  pillValue: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    minWidth: 26,
  },
  pillPlus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
