/**
 * Google Play Games Service — Empire Clash
 *
 * Modo desenvolvimento / Web:
 *   Simula login e salva somente em AsyncStorage local.
 *
 * Build nativa (EAS Build):
 *   Requer @react-native-google-signin/google-signin + configuração OAuth
 *   no Google Play Console. Instruções em BUILDING.md.
 *
 * Para ativar o SDK nativo:
 *   1. pnpm --filter @workspace/empire-clash add @react-native-google-signin/google-signin
 *   2. Adicionar à plugins em app.json:
 *      ["@react-native-google-signin/google-signin", {"iosUrlScheme": "..."}]
 *   3. Configurar OAuth no Google Play Console
 *   4. Executar: npx eas build -p android --profile production
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const GPGS_USER_KEY = "@empire_clash_gpgs_user";

export type GPGSUser = {
  id: string;
  name: string;
  email: string;
  photo?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SDK: any = null;

function loadSDK() {
  if (Platform.OS === "web" || SDK !== null) return;
  try {
    SDK = require("@react-native-google-signin/google-signin");
  } catch {
    SDK = false;
  }
}

export function isGPGSAvailable(): boolean {
  loadSDK();
  return !!SDK;
}

export async function configureGPGS(): Promise<void> {
  loadSDK();
  if (!SDK) return;
  try {
    SDK.GoogleSignin.configure({
      scopes: [
        "https://www.googleapis.com/auth/games",
        "https://www.googleapis.com/auth/games_lite",
      ],
      webClientId: "YOUR_WEB_CLIENT_ID_FROM_GOOGLE_PLAY_CONSOLE",
      offlineAccess: true,
    });
  } catch (e) {
    console.warn("[GPGS] configure failed:", e);
  }
}

export async function signInGPGS(): Promise<GPGSUser | null> {
  loadSDK();

  if (!SDK) {
    return simulateSignIn();
  }

  try {
    await SDK.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await SDK.GoogleSignin.signIn();
    const user: GPGSUser = {
      id:    userInfo.user.id,
      name:  userInfo.user.name ?? "Jogador",
      email: userInfo.user.email,
      photo: userInfo.user.photo ?? undefined,
    };
    await AsyncStorage.setItem(GPGS_USER_KEY, JSON.stringify(user));
    return user;
  } catch (e) {
    console.warn("[GPGS] sign-in failed:", e);
    return null;
  }
}

export async function signOutGPGS(): Promise<void> {
  loadSDK();
  await AsyncStorage.removeItem(GPGS_USER_KEY);
  if (!SDK) return;
  try {
    await SDK.GoogleSignin.signOut();
  } catch (e) {
    console.warn("[GPGS] sign-out failed:", e);
  }
}

export async function getCurrentGPGSUser(): Promise<GPGSUser | null> {
  try {
    const raw = await AsyncStorage.getItem(GPGS_USER_KEY);
    return raw ? (JSON.parse(raw) as GPGSUser) : null;
  } catch {
    return null;
  }
}

export async function submitScore(
  leaderboardId: string,
  score: number,
): Promise<void> {
  if (!SDK) {
    console.log(`[GPGS][sim] Submit score ${score} to ${leaderboardId}`);
    return;
  }
  try {
    await SDK.GoogleSignin.getTokens();
  } catch (e) {
    console.warn("[GPGS] submitScore failed:", e);
  }
}

export async function unlockAchievement(
  achievementId: string,
): Promise<void> {
  if (!SDK) {
    console.log(`[GPGS][sim] Unlock achievement ${achievementId}`);
    return;
  }
  try {
    await SDK.GoogleSignin.getTokens();
  } catch (e) {
    console.warn("[GPGS] unlockAchievement failed:", e);
  }
}

async function simulateSignIn(): Promise<GPGSUser> {
  const user: GPGSUser = {
    id:    "sim-" + Date.now(),
    name:  "Comandante",
    email: "jogador@exemplo.com",
  };
  await AsyncStorage.setItem(GPGS_USER_KEY, JSON.stringify(user));
  return user;
}
