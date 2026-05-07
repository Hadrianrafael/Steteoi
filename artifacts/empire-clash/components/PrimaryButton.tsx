import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { game } from "@/constants/colors";

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "gold" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const gradColors =
    variant === "gold"
      ? ([game.gold, "#E8920A"] as [string, string])
      : variant === "ghost"
        ? ([game.surfaceElevated, game.surface] as [string, string])
        : ([game.primary, game.primaryDark] as [string, string]);

  const glowColor =
    variant === "gold" ? game.gold : variant === "ghost" ? "transparent" : game.primary;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };

  const handle = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: glowColor,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Pressable
        onPress={handle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={styles.pressable}
      >
        <LinearGradient
          colors={gradColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btn}
        >
          {loading ? (
            <ActivityIndicator color={variant === "gold" ? game.bgDeep : game.text} />
          ) : (
            <View style={styles.row}>
              {icon}
              <Text
                style={[
                  styles.label,
                  variant === "gold" && { color: game.bgDeep },
                ]}
              >
                {label}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: "hidden",
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  pressable: { borderRadius: 20, overflow: "hidden" },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 16,
    letterSpacing: 1,
  },
});
