import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";
import { haptic } from "@/services/haptics";

type Tab = {
  label: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  route: string;
  color?: string;
};

const TABS: Tab[] = [
  { label: "Início",   icon: "home",         route: "/",        color: game.gold    },
  { label: "Arsenal",  icon: "fighter-jet",  route: "/planes",  color: game.gem     },
  { label: "Missões",  icon: "tasks",        route: "/missions", color: "#22C55E"   },
  { label: "Cartas",   icon: "layer-group",  route: "/cards",   color: "#A78BFA"    },
  { label: "Loja",     icon: "store",        route: "/shop",    color: "#F97316"    },
];

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const extraBottom = Platform.OS === "web" ? 8 : 0;

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + extraBottom }]}>
      <LinearGradient
        colors={[game.bgDeep + "F8", game.bgDeep]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />
      <View style={styles.border} />
      <View style={styles.row}>
        {TABS.map((tab) => {
          const active = pathname === tab.route;
          const tint = tab.color ?? game.gold;
          return (
            <Pressable
              key={tab.route}
              onPress={() => { haptic.tap(); router.push(tab.route as never); }}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.75 : 1 }]}
            >
              {active && (
                <View style={[styles.activePill, { backgroundColor: tint + "22" }]} />
              )}
              <View style={[styles.iconWrap, active && { backgroundColor: tint + "18" }]}>
                <FontAwesome5
                  name={tab.icon}
                  size={active ? 17 : 16}
                  color={active ? tint : game.muted}
                />
              </View>
              <Text style={[styles.label, { color: active ? tint : game.muted }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    paddingTop: 2,
    backgroundColor: "transparent",
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: game.border + "90",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: -2,
    left: 8,
    right: 8,
    bottom: -2,
    borderRadius: 14,
  },
  iconWrap: {
    width: 38,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
