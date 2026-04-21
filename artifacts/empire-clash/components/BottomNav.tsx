import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { game } from "@/constants/colors";

type Item = {
  label: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  route: string;
  center?: boolean;
};

const ITEMS: Item[] = [
  { label: "Loja", icon: "store", route: "/shop" },
  { label: "Inventário", icon: "shield-alt", route: "/inventory" },
  { label: "Batalha", icon: "crosshairs", route: "/play", center: true },
  { label: "Ranking", icon: "trophy", route: "/ranking" },
  { label: "Eventos", icon: "calendar-alt", route: "/events" },
];

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient
      colors={[game.bg + "00", game.bgDeep]}
      style={[styles.wrap, { paddingBottom: insets.bottom + 8 + webBottom }]}
    >
      <View style={styles.row}>
        {ITEMS.map((item) => {
          const active = pathname === item.route;
          if (item.center) {
            return (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as never)}
                style={styles.centerWrap}
              >
                <LinearGradient
                  colors={[game.primary, game.primaryDark]}
                  style={styles.centerBtn}
                >
                  <FontAwesome5
                    name={item.icon}
                    size={26}
                    color={game.text}
                  />
                </LinearGradient>
                <Text style={[styles.label, styles.centerLabel]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as never)}
              style={styles.item}
            >
              <FontAwesome5
                name={item.icon}
                size={20}
                color={active ? game.gold : game.textDim}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? game.gold : game.textDim },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: game.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: -28,
    gap: 4,
  },
  centerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: game.bgDeep,
    shadowColor: game.primary,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  centerLabel: {
    color: game.text,
    fontFamily: "Inter_700Bold",
  },
});
