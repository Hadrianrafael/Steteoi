import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { MAPS } from "@/lib/maps";

export default function InventoryScreen() {
  const { profile } = useGame();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}
    >
      <Section title="ESTATÍSTICAS">
        <View style={styles.statsGrid}>
          <Stat icon="trophy" color={game.gold} value={profile.trophies} label="Troféus" />
          <Stat icon="medal" color={game.purple} value={profile.level} label="Nível" />
          <Stat icon="flag" color={game.primary} value={profile.campaignProgress - 1} label="Conquistas" />
          <Stat icon="crown" color={game.gem} value={profile.ownedSkins.length} label="Skins" />
        </View>
      </Section>

      <Section title="MAPAS">
        <View style={{ gap: 8 }}>
          {MAPS.map((m) => {
            const unlocked = profile.unlockedMaps.includes(m.id);
            return (
              <View
                key={m.id}
                style={[
                  styles.row,
                  !unlocked && { opacity: 0.5 },
                ]}
              >
                <View style={styles.flagBadge}>
                  <Text style={styles.flagText}>{m.flag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{m.name}</Text>
                  <Text style={styles.rowSub}>
                    {m.territories.length} territórios
                  </Text>
                </View>
                <FontAwesome5
                  name={unlocked ? "check-circle" : "lock"}
                  size={18}
                  color={unlocked ? game.success : game.muted}
                />
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="SKIN ATIVA">
        <View style={styles.row}>
          <LinearGradient
            colors={[game.primary, game.primaryDark]}
            style={styles.flagBadge}
          >
            <FontAwesome5 name="shield-alt" size={20} color={game.text} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{profile.selectedSkin}</Text>
            <Text style={styles.rowSub}>
              {profile.ownedSkins.length} skins na coleção
            </Text>
          </View>
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text style={styles.section}>{title}</Text>
      {children}
    </View>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <FontAwesome5 name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: game.bg },
  section: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stat: {
    width: "48%",
    padding: 14,
    backgroundColor: game.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: game.border,
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 22,
  },
  statLabel: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
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
  flagBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: game.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 13,
  },
  rowTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    textTransform: "capitalize",
  },
  rowSub: {
    color: game.textDim,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
