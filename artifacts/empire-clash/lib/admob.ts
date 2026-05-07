/**
 * AdMob wrapper — funciona em dois modos:
 *
 * ① Desenvolvimento / Expo Go / Web
 *    → Simula o anúncio com um timer de 4 s (sem SDK nativo)
 *
 * ② Build nativa (APK/AAB via EAS Build)
 *    → Usa react-native-google-mobile-ads com IDs reais
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

const admobExtra = Constants.expoConfig?.extra?.admob as
  | Record<string, string | boolean>
  | undefined;

export const AD_CONFIG = {
  androidAppId:
    (admobExtra?.androidAppId as string | undefined) ??
    "ca-app-pub-1752902298077786~3887343530",
  rewardedId:
    (admobExtra?.rewardedAndroid as string | undefined) ??
    "ca-app-pub-1752902298077786/8272251612",
  interstitialId:
    (admobExtra?.interstitialAndroid as string | undefined) ??
    "ca-app-pub-1752902298077786/8252070315",
  useTestAds: (admobExtra?.useTestAds as boolean | undefined) ?? false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let NativeAdMob: any = null;

function tryLoadNativeSDK() {
  if (Platform.OS === "web" || NativeAdMob !== null) return;
  try {
    NativeAdMob = require("react-native-google-mobile-ads");
  } catch {
    NativeAdMob = false;
  }
}

export async function initAdMob() {
  tryLoadNativeSDK();
  if (!NativeAdMob) return;
  try {
    await NativeAdMob.default().initialize();
  } catch {}
}

type RewardedOpts = {
  onEarned: () => void;
  onDismissed?: () => void;
};

export function showRewardedAd({
  onEarned,
  onDismissed,
}: RewardedOpts): () => void {
  tryLoadNativeSDK();

  if (!NativeAdMob) {
    return simulateRewarded(onEarned, onDismissed);
  }

  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } =
    NativeAdMob;
  const adId = AD_CONFIG.useTestAds ? TestIds.REWARDED : AD_CONFIG.rewardedId;
  const ad = RewardedAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: false,
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

type InterstitialOpts = { onClosed?: () => void };

export function showInterstitialAd({ onClosed }: InterstitialOpts = {}): void {
  tryLoadNativeSDK();

  if (!NativeAdMob) {
    onClosed?.();
    return;
  }

  const { InterstitialAd, AdEventType, TestIds } = NativeAdMob;
  const adId = AD_CONFIG.useTestAds
    ? TestIds.INTERSTITIAL
    : AD_CONFIG.interstitialId;
  const ad = InterstitialAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: false,
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

const AD_SIMULATION_MS = 4000;

function simulateRewarded(
  onEarned: () => void,
  onDismissed?: () => void,
): () => void {
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
