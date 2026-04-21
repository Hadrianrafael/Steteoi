import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

const FAKE_PLAYERS = [
  "Aurora",
  "Khan",
  "Volkov",
  "Rex",
  "Nyx",
  "Drako",
  "Helios",
  "Mira",
  "Caesar",
  "Zara",
  "Onyx",
  "Vega",
];

export default function RankingScreen() {
  const { profile } = useGame();

  const board = useMemo(() => {
    const list = FAKE_PLAYERS.map((name, i) => ({
      name,
      trophies: 2400 - i * 180 + Math.floor(Math.random() * 80),
      level: 50 - i * 3,
      isMe: false,
    }));
    list.push({
      name: profile.name,
      trophies: profile.trophies,
      level: profile.level,
      isMe: true,
    });
    list.sort((a, b) => b.trophies - a.trophies);
    return list;
  }, [profile.name, profile.trophies, profile.level]);

  const leagueColor =
    profile.league === "Diamante"
      ? game.gem
      : profile.league === "Ouro"
        ? game.gold
        : profile.league === "Prata"
          ? "#C0C8D8"
          : "#CD7F32";

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[leagueColor + "33", game.bg]}
        style={styles.hero}
      >
        <FontAwesome5 name="trophy" size={42} color={leagueColor} />
        <Text style={styles.leagueName}>LIGA {profile.league.toUpperCase()}</Text>
        <Text style={styles.leagueTrophies}>{profile.trophies} troféus</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: 40 }}>
        {board.map((p, idx) => (
          <View
            key={`${p.name}-${idx}`}
            style={[
              styles.row,
              p.isMe && {
                borderColor: game.gold,
                backgroundColor: game.gold + "15",
              },
            ]}
          >
            <Text
              style={[
                styles.rank,
                idx === 0 && { color: game.gold },
                idx === 1 && { color: "#C0C8D8" },
                idx === 2 && { color: "#CD7F32" },
              ]}
            >
              #{idx + 1}
            </Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {p.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>
                {p.name}
                {p.isMe && "  (Você)"}
              </Text>
              <Text style={styles.rowMeta}>Nível {p.level}</Text>
            </View>
            <View style={styles.trophyTag}>
              <FontAwesome5 name="trophy" size={11} color={game.gold} />
              <Text style={styles.trophyText}>{p.trophies}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  hero: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: game.border,
  },
  leagueName: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    letterSpacing: 3,
    marginTop: 8,
  },
  leagueTrophies: {
    color: game.textDim,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: game.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  rank: {
    color: game.textDim,
    fontFamily: "Inter_900Black",
    fontSize: 16,
    width: 36,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: game.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  rowName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  rowMeta: {
    color: game.textDim,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  trophyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: game.bgDeep,
  },
  trophyText: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
