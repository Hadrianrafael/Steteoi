/**
 * WelcomeScreen — Empire Clash
 * Tela de boas-vindas moderna exibida apenas no primeiro acesso.
 * Solicita nome do comandante e login com Google Play Games.
 */

import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { JetSvg } from "@/components/jets/JetSvg";
import { game } from "@/constants/colors";
import { haptic } from "@/services/haptics";

type Props = {
  onComplete: (name: string) => void;
};

export function WelcomeScreen({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    const trimmed = name.trim() || "Comandante";
    haptic.play();
    onComplete(trimmed);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[game.bgDeep, game.bg, "#0A0F2A"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Hero jets formation */}
      <View style={styles.jetsRow}>
        <View style={{ opacity: 0.5, transform: [{ scale: 0.7 }] }}>
          <JetSvg model="F16" color={game.gem} size={56} />
        </View>
        <JetSvg model="F22" color={game.gold} size={72} />
        <View style={{ opacity: 0.5, transform: [{ scale: 0.7 }] }}>
          <JetSvg model="SU57" color={game.primary} size={56} />
        </View>
      </View>

      {/* Glow under jets */}
      <View style={styles.jetsGlow} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Title */}
        <Text style={styles.eyebrow}>BEM-VINDO AO</Text>
        <Text style={styles.title}>EMPIRE CLASH</Text>
        <View style={styles.underline} />
        <Text style={styles.subtitle}>
          O maior jogo de conquista aérea do Brasil.{"\n"}
          Monte sua frota e domine os céus.
        </Text>

        {/* Name input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>SEU NOME DE COMANDANTE</Text>
          <View
            style={[
              styles.inputBox,
              focused && { borderColor: game.gold, backgroundColor: game.gold + "11" },
            ]}
          >
            <FontAwesome5
              name="user-astronaut"
              size={16}
              color={focused ? game.gold : game.muted}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: General Hadrian"
              placeholderTextColor={game.muted}
              style={styles.input}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: f.color }]} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={[game.gold, "#FF8E2E", game.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startBtn}
          >
            <FontAwesome5 name="crown" size={20} color={game.bgDeep} />
            <Text style={styles.startBtnText}>INICIAR CONQUISTA</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.legal}>
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade.
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const FEATURES = [
  { text: "6 caças militares reais com stats únicos", color: game.gem },
  { text: "Sistema de cartas, missões e recompensas offline", color: game.gold },
  { text: "Ranking global e ligas competitivas", color: game.success },
  { text: "Monetização justa — sempre grátis para jogar", color: game.purple },
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: game.bgDeep,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  jetsRow: {
    position: "absolute",
    top: "12%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  jetsGlow: {
    position: "absolute",
    top: "22%",
    width: 200,
    height: 60,
    backgroundColor: game.gold,
    borderRadius: 100,
    opacity: 0.08,
    alignSelf: "center",
  },
  content: {
    width: "100%",
    padding: 28,
    paddingBottom: 40,
    alignItems: "center",
    gap: 16,
    backgroundColor: game.surface + "EE",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: game.border,
  },
  eyebrow: {
    color: game.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 4,
  },
  title: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 30,
    letterSpacing: 4,
    marginTop: -4,
  },
  underline: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: game.primary,
    marginBottom: 4,
  },
  subtitle: {
    color: game.textDim,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  inputSection: {
    width: "100%",
    gap: 6,
  },
  inputLabel: {
    color: game.muted,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
    paddingHorizontal: 2,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: game.bgDeep,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: game.border,
  },
  input: {
    flex: 1,
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    paddingVertical: 14,
  },
  features: {
    width: "100%",
    gap: 8,
    backgroundColor: game.bgDeep,
    borderRadius: 16,
    padding: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  startBtnText: {
    color: game.bgDeep,
    fontFamily: "Inter_900Black",
    fontSize: 16,
    letterSpacing: 2,
  },
  legal: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 15,
  },
});
