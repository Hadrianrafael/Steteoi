import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";

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

function JetShape({ color }: { color: string }) {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      <Defs>
        <SvgGrad id="jg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="50%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </SvgGrad>
      </Defs>
      {/* Main fuselage */}
      <Path d="M15,1 L17.5,9 L22,16 L19,17.5 L15,13.5 L11,17.5 L8,16 L12.5,9 Z" fill="url(#jg)" />
      {/* Left wing */}
      <Path d="M11,14 L2,25 L7.5,22 L11.5,17 Z" fill={color} opacity={0.88} />
      {/* Right wing */}
      <Path d="M19,14 L28,25 L22.5,22 L18.5,17 Z" fill={color} opacity={0.88} />
      {/* Left tail */}
      <Path d="M12,18 L8.5,26.5 L13,23.5 L15,21 Z" fill={color} opacity={0.65} />
      {/* Right tail */}
      <Path d="M18,18 L21.5,26.5 L17,23.5 L15,21 Z" fill={color} opacity={0.65} />
      {/* Cockpit glint */}
      <Path d="M15,3 L16.2,7.5 L15,10 L13.8,7.5 Z" fill="#FFFFFF" opacity={0.65} />
    </Svg>
  );
}

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
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onDone();
    });
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 380, useNativeDriver: false }),
        Animated.timing(glowPulse, { toValue: 0, duration: 380, useNativeDriver: false }),
      ]),
    ).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const left = t.interpolate({ inputRange: [0, 1], outputRange: [fromX - 19, toX - 19] });
  const top = t.interpolate({ inputRange: [0, 1], outputRange: [fromY - 19, toY - 19] });

  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });
  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });

  const angle = (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI + 90;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 38,
        height: 38,
        left,
        top,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Neon glow halo */}
      <Animated.View
        style={{
          position: "absolute",
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: color,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />
      {/* Jet body */}
      <View style={{ transform: [{ rotate: `${angle}deg` }] }}>
        <JetShape color={color} />
      </View>
      {/* Troop count badge */}
      <View
        style={{
          position: "absolute",
          bottom: -9,
          paddingHorizontal: 5,
          paddingVertical: 1,
          backgroundColor: "#000000DD",
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: color,
          minWidth: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 9,
            fontFamily: "Inter_700Bold",
          }}
        >
          {troops}
        </Text>
      </View>
    </Animated.View>
  );
}
