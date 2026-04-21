import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "@/components/BottomNav";
import { MapPreview } from "@/components/MapPreview";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TopBar } from "@/components/TopBar";
import { game } from "@/constants/colors";
import { useGame, xpProgress } from "@/contexts/GameContext";
import { MAPS } from "@/lib/maps";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, claimDailyLogin } = useGame();
  const [reward, setReward] = useState<{
    reward: number;
    type: "coins" | "gems";
  } | null>(null);
  const [pulse] = useState(new Animated.Value(1));
  const [mapIndex, setMapIndex] = useState(0);

  useEffect(() => {
    const r = claimDailyLogin();
    if (r) setReward(r);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const visibleMaps = useMemo(() => MAPS, []);
  const currentMap = visibleMaps[mapIndex]!;
  const isLocked = !profile.unlockedMaps.includes(currentMap.id);

  const xpFrac = xpProgress(profile);

  return (
    <View style={styles.root}>
      <Image
        source={require("../assets/images/menu-bg.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[game.bgDeep + "E6", game.bg + "CC", game.bgDeep + "F2"]}
        style={StyleSheet.absoluteFillObject}
      />

      <TopBar />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Player card */}
        <View style={styles.playerCard}>
          <View style={styles.avatarRing}>
            <LinearGradient
              colors={[game.gold, game.primary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{profile.level}</Text>
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerName}>{profile.name}</Text>
            <View style={styles.leagueRow}>
              <FontAwesome5
                name="trophy"
                size={11}
                color={
                  profile.league === "Diamante"
                    ? game.gem
                    : profile.league === "Ouro"
                      ? game.gold
                      : profile.league === "Prata"
                        ? "#C0C8D8"
                        : "#CD7F32"
                }
              />
              <Text style={styles.leagueText}>
                {profile.league} · {profile.trophies}
              </Text>
            </View>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${Math.min(100, xpFrac * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.xpLabel}>
              Nível {profile.level} · {profile.xp}/{profile.level * 100} XP
            </Text>
          </View>
        </View>

        {reward && (
          <View style={styles.rewardBanner}>
            <FontAwesome5
              name={reward.type === "gems" ? "gem" : "coins"}
              size={14}
              color={reward.type === "gems" ? game.gem : game.gold}
            />
            <Text style={styles.rewardText}>
              Recompensa diária: +{reward.reward}{" "}
              {reward.type === "gems" ? "gemas" : "moedas"}
            </Text>
          </View>
        )}

        {/* Map carousel */}
        <View style={styles.mapHeader}>
          <Pressable
            onPress={() =>
              setMapIndex(
                (mapIndex - 1 + visibleMaps.length) % visibleMaps.length,
              )
            }
            style={styles.arrowBtn}
            hitSlop={10}
          >
            <Feather name="chevron-left" size={22} color={game.text} />
          </Pressable>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={styles.mapName}>{currentMap.name.toUpperCase()}</Text>
            <Text style={styles.mapSubtitle}>
              {currentMap.territories.length} territórios
            </Text>
          </View>
          <Pressable
            onPress={() => setMapIndex((mapIndex + 1) % visibleMaps.length)}
            style={styles.arrowBtn}
            hitSlop={10}
          >
            <Feather name="chevron-right" size={22} color={game.text} />
          </Pressable>
        </View>

        <View style={styles.mapFrame}>
          <LinearGradient
            colors={[game.surfaceElevated, game.surface]}
            style={styles.mapInner}
          >
            <MapPreview map={currentMap} size={280} />
            {isLocked && (
              <View style={styles.lockOverlay}>
                <FontAwesome5 name="lock" size={28} color={game.gold} />
                <Text style={styles.lockText}>Desbloqueie em breve</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Play button */}
        <Animated.View
          style={{
            transform: [{ scale: pulse }],
            paddingHorizontal: 24,
            marginTop: 18,
          }}
        >
          <PrimaryButton
            label={isLocked ? "BLOQUEADO" : "JOGAR"}
            disabled={isLocked}
            onPress={() => router.push(`/play?mapId=${currentMap.id}` as never)}
            icon={
              <FontAwesome5 name="crown" size={18} color={game.text} />
            }
            style={{ paddingVertical: 4 }}
          />
        </Animated.View>

        {/* Quick actions */}
        <View style={styles.quickGrid}>
          <QuickCard
            icon="medal"
            color={game.gold}
            label="Passe de Temporada"
            onPress={() => router.push("/events")}
          />
          <QuickCard
            icon="bolt"
            color={game.energy}
            label="Eventos Semanais"
            onPress={() => router.push("/events")}
          />
          <QuickCard
            icon="users"
            color={game.gem}
            label="Multiplayer 1v1"
            onPress={() => router.push(`/play?mapId=${currentMap.id}&mode=mp1v1` as never)}
          />
          <QuickCard
            icon="user-friends"
            color={game.purple}
            label="Mesa de 5"
            onPress={() => router.push(`/play?mapId=${currentMap.id}&mode=mp5` as never)}
          />
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function QuickCard({
  icon,
  color,
  label,
  onPress,
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <LinearGradient
        colors={[game.surfaceElevated, game.surface]}
        style={styles.quickInner}
      >
        <View style={[styles.quickIcon, { backgroundColor: color + "22" }]}>
          <FontAwesome5 name={icon} size={18} color={color} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  playerCard: {
    marginHorizontal: 14,
    marginTop: 4,
    padding: 14,
    backgroundColor: game.surface + "DD",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 30,
    backgroundColor: game.gold,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 20,
  },
  playerName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  leagueText: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  xpBar: {
    height: 6,
    backgroundColor: game.bgDeep,
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: game.gold,
  },
  xpLabel: {
    color: game.muted,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  rewardBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: game.gold + "22",
    borderWidth: 1,
    borderColor: game.gold + "55",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 18,
  },
  mapName: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    letterSpacing: 1.5,
  },
  mapSubtitle: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: game.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  mapFrame: {
    marginTop: 12,
    marginHorizontal: 14,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: game.border,
  },
  mapInner: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: game.bgDeep + "CC",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  lockText: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    marginTop: 18,
    gap: 10,
  },
  quickCard: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: game.border,
  },
  quickInner: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    flex: 1,
  },
});
