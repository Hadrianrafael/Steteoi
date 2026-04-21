import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import { game } from "@/constants/colors";

export type FlightProps = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration: number;
  color: string;
  troops: number;
  onDone: () => void;
};

export function Plane({
  fromX,
  fromY,
  toX,
  toY,
  duration,
  color,
  troops,
  onDone,
}: FlightProps) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onDone();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const left = t.interpolate({
    inputRange: [0, 1],
    outputRange: [fromX - 14, toX - 14],
  });
  const top = t.interpolate({
    inputRange: [0, 1],
    outputRange: [fromY - 14, toY - 14],
  });

  // Rotate plane towards direction
  const angle = (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI + 45;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 28,
        height: 28,
        left,
        top,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotate: `${angle}deg` }],
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: game.text,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: 6,
        }}
      >
        <FontAwesome5 name="paper-plane" size={12} color={game.text} />
      </View>
      <View
        style={{
          marginTop: -2,
          paddingHorizontal: 4,
          paddingVertical: 1,
          backgroundColor: game.bgDeep,
          borderRadius: 4,
          transform: [{ rotate: `${-angle}deg` }],
        }}
      >
        <Animated.Text
          style={{
            color: game.text,
            fontSize: 9,
            fontFamily: "Inter_700Bold",
          }}
        >
          {troops}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}
