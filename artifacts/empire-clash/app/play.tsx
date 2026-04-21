import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { MAPS, getMap } from "@/lib/maps";

type Mode = "campaign" | "mp1v1" | "mp5" | "ranked";

const MODES: {
  id: Mode;
  title: string;
  desc: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  players: number;
  energy: number;
  color: string;
}[] = [
  {
    id: "campaign",
    title: "Campanha",
    desc: "Níveis progressivos vs IA",
    icon: "flag",
    players: 2,
    energy: 1,
    color: game.primary,
  },
  {
    id: "mp1v1",
    title: "1v1 Online",
    desc: "Duelo rápido",
    icon: "user-friends",
    players: 2,
    energy: 1,
    color: game.gem,
  },
  {
    id: "mp5",
    title: "Mesa de 5",
    desc: "Batalha caótica",
    icon: "users",
    players: 5,
    energy: 2,
    color: game.purple,
  },
  {
    id: "ranked",
    title: "Liga Ranqueada",
    desc: "Suba na liga",
    icon: "medal",
    players: 2,
    energy: 2,
    color: game.gold,
  },
];

export default function PlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mapId?: string; mode?: string }>();
  const { profile, consumeEnergy } = useGame();

  const [mapId, setMapId] = useState<string>(params.mapId ?? "usa");
  const [mode, setMode] = useState<Mode>((params.mode as Mode) ?? "campaign");

  const map = getMap(mapId);
  const modeData = MODES.find((m) => m.id === mode)!;

  const start = () => {
    if (!consumeEnergy(modeData.energy)) {
      return;
    }
    router.replace(
      `/game?mapId=${map.id}&mode=${mode}&players=${modeData.players}` as never,
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Feather name="x" size={22} color={game.text} />
        </Pressable>
        <Text style={styles.title}>BATALHA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>MAPA</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
        >
          {MAPS.map((m) => {
            const locked = !profile.unlockedMaps.includes(m.id);
            const selected = m.id === mapId;
            return (
              <Pressable
                key={m.id}
                disabled={locked}
                onPress={() => setMapId(m.id)}
                style={[
                  styles.mapChip,
                  selected && {
                    borderColor: game.gold,
                    backgroundColor: game.gold + "22",
                  },
                  locked && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.mapChipFlag}>{m.flag}</Text>
                <Text style={styles.mapChipName}>{m.name}</Text>
                {locked && (
                  <FontAwesome5 name="lock" size={9} color={game.muted} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.section, { marginTop: 22 }]}>MODO</Text>
        <View style={{ gap: 10 }}>
          {MODES.map((m) => {
            const selected = m.id === mode;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMode(m.id)}
                style={[
                  styles.modeRow,
                  selected && { borderColor: m.color },
                ]}
              >
                <View
                  style={[styles.modeIcon, { backgroundColor: m.color + "22" }]}
                >
                  <FontAwesome5 name={m.icon} size={18} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeTitle}>{m.title}</Text>
                  <Text style={styles.modeDesc}>{m.desc}</Text>
                </View>
                <View style={styles.energyTag}>
                  <FontAwesome5 name="bolt" size={10} color={game.energy} />
                  <Text style={styles.energyTagText}>{m.energy}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {profile.energy < modeData.energy && (
          <View style={styles.warn}>
            <FontAwesome5 name="bolt" size={12} color={game.danger} />
            <Text style={styles.warnText}>
              Energia insuficiente. Aguarde recarga ou use gemas.
            </Text>
          </View>
        )}
      </ScrollView>

      <LinearGradient
        colors={[game.bg + "00", game.bgDeep]}
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}
      >
        <PrimaryButton
          label={`COMEÇAR · ${modeData.energy} energia`}
          onPress={start}
          disabled={profile.energy < modeData.energy}
          icon={<FontAwesome5 name="crown" size={16} color={game.text} />}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: game.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: game.border,
  },
  title: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 18,
    letterSpacing: 2,
  },
  section: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  mapChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    borderColor: game.border,
  },
  mapChipFlag: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  mapChipName: {
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: game.surface,
    borderWidth: 1.5,
    borderColor: game.border,
  },
  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  modeDesc: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  energyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: game.bgDeep,
  },
  energyTagText: {
    color: game.energy,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  warn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: game.danger + "22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: game.danger + "55",
  },
  warnText: {
    color: game.text,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingTop: 24,
  },
});
