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
    profile.league === "Lendário"
      ? "#FF3DBE"
      : profile.league === "Mestre"
        ? "#9B5DFF"
        : profile.league === "Diamante"
          ? game.gem
          : profile.league === "Ouro"
            ? game.gold
            : profile.league === "Prata"
              ? "#C0C8D8"
              : "#CD7F32";

  const seasonRewards = [
    { league: "Bronze", coins: 200, gems: 5 },
    { league: "Prata", coins: 500, gems: 15 },
    { league: "Ouro", coins: 1200, gems: 40 },
    { league: "Diamante", coins: 3000, gems: 100 },
    { league: "Mestre", coins: 7000, gems: 250 },
    { league: "Lendário", coins: 15000, gems: 600 },
  ];

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
        {/* Season banner */}
        <View style={styles.seasonCard}>
          <View style={styles.seasonHead}>
            <FontAwesome5 name="calendar-alt" size={14} color={game.gold} />
            <Text style={styles.seasonTitle}>TEMPORADA 1 · 23 DIAS</Text>
          </View>
          <Text style={styles.seasonSub}>
            Suba de liga até o fim da temporada e ganhe recompensas
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginTop: 10 }}
          >
            {seasonRewards.map((r) => {
              const reached = profile.league === r.league;
              return (
                <View
                  key={r.league}
                  style={[
                    styles.rewardChip,
                    reached && {
                      borderColor: game.gold,
                      backgroundColor: game.gold + "22",
                    },
                  ]}
                >
                  <FontAwesome5 name="trophy" size={11} color={game.gold} />
                  <Text style={styles.rewardLeague}>{r.league}</Text>
                  <View style={styles.rewardRow}>
                    <FontAwesome5 name="coins" size={9} color={game.gold} />
                    <Text style={styles.rewardTxt}>{r.coins}</Text>
                  </View>
                  <View style={styles.rewardRow}>
                    <FontAwesome5 name="gem" size={9} color={game.gem} />
                    <Text style={styles.rewardTxt}>{r.gems}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <Text style={styles.boardTitle}>RANKING GLOBAL</Text>

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
  seasonCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1,
    borderColor: game.gold + "55",
  },
  seasonHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  seasonTitle: {
    color: game.gold,
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  seasonSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 4,
  },
  rewardChip: {
    width: 90,
    padding: 10,
    borderRadius: 12,
    backgroundColor: game.bgDeep,
    borderWidth: 1.5,
    borderColor: game.border,
    alignItems: "center",
    gap: 4,
  },
  rewardLeague: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 10,
    letterSpacing: 1,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rewardTxt: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  boardTitle: {
    color: game.textDim,
    fontFamily: "Inter_900Black",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 8,
  },
});
