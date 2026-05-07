import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import {
  GPGSUser,
  getCurrentGPGSUser,
  isGPGSAvailable,
  signInGPGS,
  signOutGPGS,
} from "@/services/googlePlayGames";

export default function SettingsScreen() {
  const { profile, reset, refillEnergy } = useGame();
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState(profile.name);
  const [gpgsUser, setGpgsUser] = useState<GPGSUser | null>(null);
  const [gpgsLoading, setGpgsLoading] = useState(false);

  useEffect(() => {
    getCurrentGPGSUser().then(setGpgsUser);
  }, []);

  const handleGPGSLogin = async () => {
    if (gpgsLoading) return;
    setGpgsLoading(true);
    try {
      const user = await signInGPGS();
      setGpgsUser(user);
      if (user) {
        Alert.alert(
          "Login realizado!",
          `Bem-vindo, ${user.name}!\nSeu progresso será sincronizado.`,
        );
      } else {
        Alert.alert("Erro", "Não foi possível fazer login. Tente novamente.");
      }
    } finally {
      setGpgsLoading(false);
    }
  };

  const handleGPGSLogout = () => {
    Alert.alert(
      "Desconectar Google Play",
      "Seu progresso local será mantido. Deseja sair da conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await signOutGPGS();
            setGpgsUser(null);
          },
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Resetar progresso?",
      "Isso apagará todo o seu progresso. Não pode ser desfeito.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Resetar", style: "destructive", onPress: () => reset() },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: 60 }}
    >
      {/* Google Play Games */}
      <Section title="GOOGLE PLAY GAMES">
        {gpgsUser ? (
          <View style={styles.gpgsCard}>
            <View style={styles.gpgsAvatar}>
              {gpgsUser.photo ? (
                <Image
                  source={{ uri: gpgsUser.photo }}
                  style={styles.gpgsAvatarImg}
                />
              ) : (
                <FontAwesome5
                  name="gamepad"
                  size={22}
                  color={game.success}
                />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.gpgsName}>{gpgsUser.name}</Text>
              <Text style={styles.gpgsEmail} numberOfLines={1}>
                {gpgsUser.email}
              </Text>
              <Text style={styles.gpgsStatus}>✓ Conectado — progresso sincronizado</Text>
            </View>
            <Pressable
              onPress={handleGPGSLogout}
              style={styles.gpgsLogoutBtn}
              hitSlop={8}
            >
              <Feather name="log-out" size={16} color={game.muted} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleGPGSLogin}
            disabled={gpgsLoading}
            style={({ pressed }) => [
              styles.gpgsLoginBtn,
              { opacity: gpgsLoading ? 0.7 : pressed ? 0.85 : 1 },
            ]}
          >
            <FontAwesome5 name="google" size={18} color={game.text} />
            <View style={{ flex: 1 }}>
              <Text style={styles.gpgsLoginTitle}>
                {gpgsLoading ? "Conectando..." : "Entrar com Google Play"}
              </Text>
              <Text style={styles.gpgsLoginSub}>
                Salve progresso e dispute no ranking global
              </Text>
            </View>
            {!gpgsLoading && (
              <Feather name="chevron-right" size={18} color={game.muted} />
            )}
          </Pressable>
        )}

        {!isGPGSAvailable() && (
          <View style={styles.gpgsNote}>
            <FontAwesome5
              name="info-circle"
              size={11}
              color={game.muted}
            />
            <Text style={styles.gpgsNoteText}>
              Login real disponível apenas na versão instalada da Play Store.
            </Text>
          </View>
        )}
      </Section>

      {/* Perfil */}
      <Section title="PERFIL DO COMANDANTE">
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
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.level}</Text>
            <Text style={styles.statLabel}>Nível</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.totalWins}</Text>
            <Text style={styles.statLabel}>Vitórias</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.trophies}</Text>
            <Text style={styles.statLabel}>Troféus</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: game.gold }]}>
              {profile.coins}
            </Text>
            <Text style={styles.statLabel}>Moedas</Text>
          </View>
        </View>
      </Section>

      {/* Som e vibração */}
      <Section title="SOM E VIBRAÇÃO">
        <Toggle
          label="Efeitos sonoros"
          value={sound}
          onChange={setSound}
          icon="volume-2"
        />
        <Toggle
          label="Música de fundo"
          value={music}
          onChange={setMusic}
          icon="music"
        />
        <Toggle
          label="Vibração háptica"
          value={haptics}
          onChange={setHaptics}
          icon="smartphone"
        />
      </Section>

      {/* Notificações */}
      <Section title="NOTIFICAÇÕES">
        <Toggle
          label="Notificações push"
          value={notifications}
          onChange={setNotifications}
          icon="bell"
        />
      </Section>

      {/* Atalhos (debug) */}
      <Section title="FERRAMENTAS">
        <Pressable
          style={styles.row}
          onPress={refillEnergy}
        >
          <FontAwesome5 name="bolt" size={16} color={game.energy} />
          <Text style={styles.rowText}>Recarregar energia</Text>
          <Feather name="chevron-right" size={16} color={game.muted} />
        </Pressable>
        <Pressable style={styles.row} onPress={handleReset}>
          <FontAwesome5 name="trash-alt" size={16} color={game.danger} />
          <Text style={[styles.rowText, { color: game.danger }]}>
            Resetar progresso
          </Text>
          <Feather name="chevron-right" size={16} color={game.danger} />
        </Pressable>
      </Section>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>Empire Clash · v1.0.0</Text>
        <Text style={styles.versionSub}>
          Desenvolvido por Hadrian · Build EAS SDK 54
        </Text>
        <Text style={styles.versionSub}>
          com.hadrian.empireclash · AdMob ca-app-pub-1752902298077786
        </Text>
      </View>
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
    <View style={{ gap: 8 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
  sectionTitle: {
    color: game.textDim,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.8,
    paddingHorizontal: 4,
  },
  gpgsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: game.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: game.success + "55",
  },
  gpgsAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: game.success + "22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: game.success + "55",
  },
  gpgsAvatarImg: { width: 46, height: 46, borderRadius: 23 },
  gpgsName: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  gpgsEmail: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  gpgsStatus: {
    color: game.success,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    marginTop: 2,
  },
  gpgsLogoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: game.surfaceElevated,
  },
  gpgsLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: game.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#4285F455",
  },
  gpgsLoginTitle: {
    color: game.text,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  gpgsLoginSub: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  gpgsNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    paddingHorizontal: 4,
  },
  gpgsNoteText: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
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
  statRow: {
    flexDirection: "row",
    backgroundColor: game.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: game.border,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 2,
  },
  statValue: {
    color: game.text,
    fontFamily: "Inter_900Black",
    fontSize: 16,
  },
  statLabel: {
    color: game.muted,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: game.border,
    marginVertical: 10,
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
  footer: {
    alignItems: "center",
    gap: 4,
    paddingTop: 8,
  },
  version: {
    color: game.muted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  versionSub: {
    color: game.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textAlign: "center",
  },
});
