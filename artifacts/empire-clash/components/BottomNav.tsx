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
};

const ITEMS: Item[] = [
  { label: "Loja", icon: "store", route: "/shop" },
  { label: "Aviões", icon: "plane", route: "/planes" },
  { label: "Melhorias", icon: "tools", route: "/upgrades" },
  { label: "Habilidades", icon: "bolt", route: "/skills" },
  { label: "Ranking", icon: "trophy", route: "/ranking" },
  { label: "Eventos", icon: "calendar-alt", route: "/events" },
];

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const webBottom = Platform.OS === "web" ? 30 : 0;

  return (
    <LinearGradient
      colors={[game.bg + "00", game.bgDeep]}
      style={[styles.wrap, { paddingBottom: insets.bottom + 8 + webBottom }]}
    >
      <View style={styles.row}>
        {ITEMS.map((item) => {
          const active = pathname === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.item,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  active && {
                    backgroundColor: game.gold + "22",
                    borderColor: game.gold,
                  },
                ]}
              >
                <FontAwesome5
                  name={item.icon}
                  size={18}
                  color={active ? game.gold : game.textDim}
                />
              </View>
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
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: game.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  label: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
  },
});
