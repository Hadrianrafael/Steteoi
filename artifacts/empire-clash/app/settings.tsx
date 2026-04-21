import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { game } from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";

export default function SettingsScreen() {
  const { profile, reset, refillEnergy } = useGame();
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState(profile.name);

  const handleReset = () => {
    Alert.alert(
      "Resetar progresso?",
      "Isso apagará todo o seu progresso. Não pode ser desfeito.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetar",
          style: "destructive",
          onPress: () => reset(),
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: 60 }}
    >
      <Section title="PERFIL">
        <View style={styles.field}>
          <Feather name="user" size={16} color={game.textDim} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome de comandante"
            placeholderTextColor={game.muted}
            style={styles.input}
          />
        </View>
      </Section>

      <Section title="SOM E VIBRAÇÃO">
        <Toggle label="Efeitos sonoros" value={sound} onChange={setSound} icon="volume-2" />
        <Toggle label="Música" value={music} onChange={setMusic} icon="music" />
        <Toggle label="Vibração" value={haptics} onChange={setHaptics} icon="smartphone" />
      </Section>

      <Section title="NOTIFICAÇÕES">
        <Toggle
          label="Notificações push"
          value={notifications}
          onChange={setNotifications}
          icon="bell"
        />
      </Section>

      <Section title="ATALHOS">
        <Pressable style={styles.row} onPress={refillEnergy}>
          <FontAwesome5 name="bolt" size={16} color={game.energy} />
          <Text style={styles.rowText}>Recarregar energia (debug)</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={handleReset}>
          <FontAwesome5 name="trash-alt" size={16} color={game.danger} />
          <Text style={[styles.rowText, { color: game.danger }]}>
            Resetar progresso
          </Text>
        </Pressable>
      </Section>

      <Text style={styles.version}>Empire Clash · v1.0.0</Text>
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
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={16} color={game.textDim} />
      <Text style={styles.rowText}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? game.gold : game.muted}
        trackColor={{ false: game.surfaceElevated, true: game.gold + "55" }}
      />
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: game.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  input: {
    flex: 1,
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: game.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: game.border,
  },
  rowText: {
    flex: 1,
    color: game.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  version: {
    textAlign: "center",
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 14,
  },
});
