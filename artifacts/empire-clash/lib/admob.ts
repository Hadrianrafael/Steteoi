/**
 * AdMob wrapper — funciona em dois modos:
 *
 * ① Desenvolvimento / Expo Go / Web
 *    → Simula o anúncio com um timer de 4 s (sem SDK nativo)
 *
 * ② Build nativa (APK/AAB via EAS Build)
 *    → Usa react-native-google-mobile-ads com IDs reais ou de teste
 *
 * Para ativar o SDK real no build:
 *   1. Adicione em artifacts/empire-clash:
 *        pnpm add react-native-google-mobile-ads
 *   2. Adicione o plugin em app.json → plugins:
 *        ["react-native-google-mobile-ads", { "androidAppId": "ca-app-pub-XXX~XXX" }]
 *   3. Substitua extra.admob.androidAppId / rewardedAndroid / interstitialAndroid
 *      pelos IDs reais do AdMob console.
 *   4. Mude extra.admob.useTestAds para false em produção.
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── Configuração ──────────────────────────────────────────────────────────
const admobExtra = Constants.expoConfig?.extra?.admob as Record<string, string | boolean> | undefined;

export const AD_CONFIG = {
  androidAppId:
    (admobExtra?.androidAppId as string | undefined) ??
    "ca-app-pub-3940256099942544~3347511713",
  rewardedId:
    (admobExtra?.rewardedAndroid as string | undefined) ??
    "ca-app-pub-3940256099942544/5224354917",
  interstitialId:
    (admobExtra?.interstitialAndroid as string | undefined) ??
    "ca-app-pub-3940256099942544/1033173712",
  useTestAds: (admobExtra?.useTestAds as boolean | undefined) ?? true,
};

// ─── SDK nativo (opcional — só disponível em builds nativas) ────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let NativeAdMob: any = null;

function tryLoadNativeSDK() {
  if (Platform.OS === "web" || NativeAdMob !== null) return;
  try {
    NativeAdMob = require("react-native-google-mobile-ads");
  } catch {
    NativeAdMob = false; // package not installed — use simulation
  }
}

export async function initAdMob() {
  tryLoadNativeSDK();
  if (!NativeAdMob) return;
  try {
    await NativeAdMob.default().initialize();
  } catch {}
}

// ─── Rewarded Ad ────────────────────────────────────────────────────────────
type RewardedOpts = {
  onEarned: () => void;
  onDismissed?: () => void;
};

/**
 * Mostra um anúncio premiado.
 * Em dev → simula com timer de 4 s, chama onEarned automaticamente.
 * Em produção (build nativa) → usa AdMob real.
 *
 * Retorna uma função de cancelamento.
 */
export function showRewardedAd({ onEarned, onDismissed }: RewardedOpts): () => void {
  tryLoadNativeSDK();

  if (!NativeAdMob) {
    return simulateRewarded(onEarned, onDismissed);
  }

  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = NativeAdMob;
  const adId = AD_CONFIG.useTestAds ? TestIds.REWARDED : AD_CONFIG.rewardedId;
  const ad = RewardedAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: AD_CONFIG.useTestAds,
  });

  let rewarded = false;
  const s1 = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    rewarded = true;
    onEarned();
  });
  const s2 = ad.addAdEventListener(AdEventType.CLOSED, () => {
    if (!rewarded) onDismissed?.();
    s1();
    s2();
  });
  ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
  ad.addAdEventListener(AdEventType.ERROR, () => {
    s1();
    s2();
    onDismissed?.();
  });
  ad.load();

  return () => {
    s1();
    s2();
  };
}

// ─── Interstitial Ad ────────────────────────────────────────────────────────
type InterstitialOpts = { onClosed?: () => void };

/**
 * Mostra um intersticial (entre partidas).
 * Em dev → não exibe nada, chama onClosed imediatamente.
 * Em produção → usa AdMob real.
 */
export function showInterstitialAd({ onClosed }: InterstitialOpts = {}): void {
  tryLoadNativeSDK();

  if (!NativeAdMob) {
    // Skip interstitial in dev — don't interrupt flow with a timer
    onClosed?.();
    return;
  }

  const { InterstitialAd, AdEventType, TestIds } = NativeAdMob;
  const adId = AD_CONFIG.useTestAds ? TestIds.INTERSTITIAL : AD_CONFIG.interstitialId;
  const ad = InterstitialAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: AD_CONFIG.useTestAds,
  });

  const s = ad.addAdEventListener(AdEventType.CLOSED, () => {
    s();
    onClosed?.();
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    s();
    onClosed?.();
  });
  ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
  ad.load();
}

// ─── Simulação (dev) ────────────────────────────────────────────────────────
const AD_SIMULATION_MS = 4000;

function simulateRewarded(onEarned: () => void, onDismissed?: () => void): () => void {
  let cancelled = false;
  const t = setTimeout(() => {
    if (!cancelled) onEarned();
  }, AD_SIMULATION_MS);
  return () => {
    cancelled = true;
    clearTimeout(t);
    onDismissed?.();
  };
}
