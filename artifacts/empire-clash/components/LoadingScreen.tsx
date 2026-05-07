/**
 * LoadingScreen — Empire Clash
 * Tela de carregamento premium com animações de boot.
 * Exibida enquanto fontes/assets carregam.
 */

import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { JetSvg } from "@/components/jets/JetSvg";
import { game } from "@/constants/colors";

const BOOT_LINES = [
  "Carregando sistemas de combate...",
  "Sincronizando frota aérea...",
  "Conectando servidores de batalha...",
  "Empire Clash pronto para o combate.",
];

export function LoadingScreen() {
  const [lineIdx, setLineIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const jetX = useRef(new Animated.Value(-120)).current;
  const jet2X = useRef(new Animated.Value(-80)).current;
  const lineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();

    // Jets fly across — staggered
    setTimeout(() => {
      Animated.timing(jetX, {
        toValue: 500,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    }, 400);

    setTimeout(() => {
      Animated.timing(jet2X, {
        toValue: 500,
        duration: 1700,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    }, 700);

    // Progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();

    progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value * 100));
    });

    // Boot lines
    const intervals = BOOT_LINES.map((_, i) =>
      setTimeout(() => {
        setLineIdx(i);
        Animated.sequence([
          Animated.timing(lineOpacity, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(lineOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, i * 700 + 300),
    );

    return () => {
      intervals.forEach(clearTimeout);
      progressAnim.removeAllListeners();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const glowSize = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 160],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.root}>
      {/* Background */}
      <LinearGradient
        colors={[game.bgDeep, game.bg, "#0A0F2A"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Star field dots */}
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            { left: s.x, top: s.y, width: s.r, height: s.r, opacity: s.o },
          ]}
        />
      ))}

      {/* Glow behind logo */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: 100,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Flying jets */}
      <Animated.View
        style={[
          styles.flyingJet,
          { top: "30%", transform: [{ translateX: jetX }] },
        ]}
      >
        <JetSvg model="F22" color={game.gem + "CC"} size={40} />
      </Animated.View>
      <Animated.View
        style={[
          styles.flyingJet,
          { top: "34%", transform: [{ translateX: jet2X }] },
        ]}
      >
        <JetSvg model="F16" color={game.gold + "99"} size={28} />
      </Animated.View>

      {/* Logo block */}
      <Animated.View
        style={[
          styles.logoBlock,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoIconRing}>
          <LinearGradient
            colors={[game.gold, game.primary]}
            style={styles.logoIconGrad}
          >
            <Text style={styles.logoIconText}>EC</Text>
          </LinearGradient>
        </View>
        <Text style={styles.logoEye}>BATALHA PELO</Text>
        <Text style={styles.logoTitle}>EMPIRE CLASH</Text>
        <Text style={styles.logoSub}>Conquiste. Evolua. Domine.</Text>
      </Animated.View>

      {/* Boot info */}
      <View style={styles.bootBlock}>
        {/* Progress bar */}
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, { width: barWidth }]}>
            <LinearGradient
              colors={[game.primary, game.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.barShine} />
          </Animated.View>
        </View>

        <View style={styles.bootRow}>
          <Animated.Text style={[styles.bootLine, { opacity: lineOpacity }]}>
            {BOOT_LINES[lineIdx]}
          </Animated.Text>
          <Text style={styles.bootPct}>{progress}%</Text>
        </View>
      </View>

      <Text style={styles.version}>v1.0.0 · SDK 54 · com.hadrian.empireclash</Text>
    </View>
  );
}

// Deterministic "random" star positions
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 89.442) % 100),
  r: i % 3 === 0 ? 2 : 1,
  o: 0.15 + (i % 5) * 0.12,
}));

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: game.bgDeep,
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  glow: {
    position: "absolute",
    backgroundColor: game.primary,
    alignSelf: "center",
    top: "35%",
    marginTop: -80,
  },
  flyingJet: {
    position: "absolute",
    left: 0,
  },
  logoBlock: {
    alignItems: "center",
    gap: 6,
    marginBottom: 60,
  },
  logoIconRing: {
    padding: 4,
    borderRadius: 40,
    backgroundColor: game.gold + "44",
    marginBottom: 8,
  },
  logoIconGrad: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 28,
    letterSpacing: 2,
  },
  logoEye: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 5,
    marginTop: 4,
  },
  logoTitle: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 32,
    letterSpacing: 4,
  },
  logoSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 1,
  },
  bootBlock: {
    position: "absolute",
    bottom: 80,
    left: 32,
    right: 32,
    gap: 10,
  },
  barBg: {
    height: 6,
    backgroundColor: game.surfaceElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  barShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
  },
  bootRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bootLine: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
  },
  bootPct: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    marginLeft: 8,
  },
  version: {
    position: "absolute",
    bottom: 48,
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
