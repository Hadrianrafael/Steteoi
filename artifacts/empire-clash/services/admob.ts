/**
 * AdMob Service — Empire Clash
 *
 * Modo desenvolvimento (Expo Go / Web):
 *   Simula anúncios com timer de 4 s. Sem SDK nativo necessário.
 *
 * Build nativa (EAS Build APK/AAB):
 *   Usa react-native-google-mobile-ads com IDs reais de produção.
 *   Para ativar: pnpm add react-native-google-mobile-ads
 *   e adicionar plugin em app.json.
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra?.admob as
  | Record<string, string | boolean>
  | undefined;

export const AD_IDS = {
  appId:       (extra?.androidAppId as string) ?? "ca-app-pub-1752902298077786~3887343530",
  rewarded:    (extra?.rewardedAndroid as string) ?? "ca-app-pub-1752902298077786/8272251612",
  interstitial:(extra?.interstitialAndroid as string) ?? "ca-app-pub-1752902298077786/8252070315",
  useTest:     (extra?.useTestAds as boolean) ?? false,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SDK: any = null;
let initialized = false;

function loadSDK() {
  if (Platform.OS === "web" || SDK !== null) return;
  try {
    SDK = require("react-native-google-mobile-ads");
  } catch {
    SDK = false;
  }
}

export async function initAdMob(): Promise<void> {
  loadSDK();
  if (!SDK || initialized) return;
  try {
    const mobileAds = SDK.default();
    await mobileAds.initialize();
    initialized = true;
  } catch (e) {
    console.warn("[AdMob] init failed:", e);
  }
}

export type RewardedOptions = {
  onEarned: () => void;
  onDismissed?: () => void;
};

export function showRewardedAd(opts: RewardedOptions): () => void {
  loadSDK();

  if (!SDK) {
    return simulateRewarded(opts.onEarned, opts.onDismissed);
  }

  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = SDK;
  const adId = AD_IDS.useTest ? TestIds.REWARDED : AD_IDS.rewarded;

  const ad = RewardedAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: false,
    keywords: ["games", "strategy"],
  });

  let rewarded = false;

  const offEarned = ad.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      rewarded = true;
      opts.onEarned();
    },
  );

  const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    if (!rewarded) opts.onDismissed?.();
    offEarned();
    offClosed();
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    ad.show().catch(() => {
      offEarned();
      offClosed();
      opts.onDismissed?.();
    });
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    offEarned();
    offClosed();
    opts.onDismissed?.();
  });

  ad.load();

  return () => {
    offEarned();
    offClosed();
  };
}

export type InterstitialOptions = {
  onClosed?: () => void;
};

export function showInterstitialAd(opts: InterstitialOptions = {}): void {
  loadSDK();

  if (!SDK) {
    setTimeout(() => opts.onClosed?.(), 500);
    return;
  }

  const { InterstitialAd, AdEventType, TestIds } = SDK;
  const adId = AD_IDS.useTest ? TestIds.INTERSTITIAL : AD_IDS.interstitial;

  const ad = InterstitialAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: false,
    keywords: ["games", "strategy"],
  });

  const off = ad.addAdEventListener(AdEventType.CLOSED, () => {
    off();
    opts.onClosed?.();
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    off();
    opts.onClosed?.();
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    ad.show().catch(() => {
      off();
      opts.onClosed?.();
    });
  });

  ad.load();
}

const SIM_MS = 3800;

function simulateRewarded(
  onEarned: () => void,
  onDismissed?: () => void,
): () => void {
  let cancelled = false;
  const t = setTimeout(() => {
    if (!cancelled) onEarned();
  }, SIM_MS);

  return () => {
    cancelled = true;
    clearTimeout(t);
    onDismissed?.();
  };
}
