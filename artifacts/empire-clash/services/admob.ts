/**
 * AdMob Service — Empire Clash (Production)
 *
 * Fluxo completo:
 *   1. initAdMob()    → inicializa SDK + consent LGPD/GDPR
 *   2. preloadAds()   → pré-carrega rewarded e interstitial em background
 *   3. showRewardedAd / showInterstitialAd → exibe imediatamente (já carregado)
 *
 * Modo web/Expo Go: simula anúncios sem SDK nativo.
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── IDs de Produção ────────────────────────────────────────────────────────
const extra = Constants.expoConfig?.extra?.admob as
  | Record<string, string | boolean>
  | undefined;

export const AD_IDS = {
  appId:        (extra?.androidAppId as string)       ?? "ca-app-pub-1752902298077786~3887343530",
  rewarded:     (extra?.rewardedAndroid as string)    ?? "ca-app-pub-1752902298077786/8272251612",
  interstitial: (extra?.interstitialAndroid as string) ?? "ca-app-pub-1752902298077786/8252070315",
  useTest:      (extra?.useTestAds as boolean)        ?? false,
} as const;

// ─── SDK lazy load ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SDK: any = null;
let initDone = false;

function loadSDK() {
  if (SDK !== null || Platform.OS === "web") return;
  try {
    SDK = require("react-native-google-mobile-ads");
  } catch {
    SDK = false;
  }
}

// ─── Preload cache ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedRewarded: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedInterstitial: any = null;

// ─── Inicialização + Consent LGPD/GDPR ────────────────────────────────────
export async function initAdMob(): Promise<void> {
  loadSDK();
  if (!SDK || initDone) return;

  try {
    const MobileAds = SDK.default;
    const { AdsConsentStatus, AdsConsent, AdsConsentDebugGeography } = SDK;

    // 1. Solicitar consentimento (UMP — LGPD/GDPR)
    try {
      const consentInfo = await AdsConsent.requestInfoUpdate({
        // Em produção: remover debugSettings
        // debugSettings: {
        //   debugGeography: AdsConsentDebugGeography.EEA,
        //   testDeviceIdentifiers: [],
        // },
      });

      if (
        consentInfo.isConsentFormAvailable &&
        (consentInfo.status === AdsConsentStatus.UNKNOWN ||
          consentInfo.status === AdsConsentStatus.REQUIRED)
      ) {
        await AdsConsent.showForm();
      }
    } catch {
      // Consent não disponível na região — continuar normalmente
    }

    // 2. Inicializar SDK
    await MobileAds().initialize();
    initDone = true;

    // 3. Pré-carregar anúncios em background
    preloadAds();
  } catch (e) {
    console.warn("[AdMob] init failed:", e);
  }
}

// ─── Pré-carregamento ──────────────────────────────────────────────────────
export function preloadAds(): void {
  loadSDK();
  if (!SDK) return;

  _preloadRewarded();
  _preloadInterstitial();
}

function _preloadRewarded(): void {
  if (!SDK) return;
  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = SDK;
  const adId = AD_IDS.useTest ? TestIds.REWARDED : AD_IDS.rewarded;

  const ad = RewardedAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: false,
    keywords: ["games", "strategy", "military"],
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    cachedRewarded = ad;
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    cachedRewarded = null;
    // Tentar de novo em 30s
    setTimeout(_preloadRewarded, 30_000);
  });

  ad.load();
}

function _preloadInterstitial(): void {
  if (!SDK) return;
  const { InterstitialAd, AdEventType, TestIds } = SDK;
  const adId = AD_IDS.useTest ? TestIds.INTERSTITIAL : AD_IDS.interstitial;

  const ad = InterstitialAd.createForAdRequest(adId, {
    requestNonPersonalizedAdsOnly: false,
    keywords: ["games", "strategy", "military"],
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    cachedInterstitial = ad;
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    cachedInterstitial = null;
    setTimeout(_preloadInterstitial, 30_000);
  });

  ad.load();
}

// ─── Rewarded Ad ───────────────────────────────────────────────────────────
export type RewardedOptions = {
  onEarned: () => void;
  onDismissed?: () => void;
};

export function showRewardedAd(opts: RewardedOptions): () => void {
  loadSDK();

  if (!SDK) {
    return _simulateRewarded(opts.onEarned, opts.onDismissed);
  }

  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = SDK;

  // Usar anúncio pré-carregado se disponível
  const ad =
    cachedRewarded ??
    RewardedAd.createForAdRequest(
      AD_IDS.useTest ? TestIds.REWARDED : AD_IDS.rewarded,
      { requestNonPersonalizedAdsOnly: false, keywords: ["games", "strategy"] },
    );

  // Limpar cache — será recarregado após exibição
  cachedRewarded = null;

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
    // Pré-carregar próximo
    setTimeout(_preloadRewarded, 1_000);
  });

  const tryShow = () => {
    ad.show().catch(() => {
      offEarned();
      offClosed();
      opts.onDismissed?.();
    });
  };

  if (ad.loaded) {
    tryShow();
  } else {
    ad.addAdEventListener(AdEventType.LOADED, tryShow);
    ad.addAdEventListener(AdEventType.ERROR, () => {
      offEarned();
      offClosed();
      opts.onDismissed?.();
    });
    ad.load();
  }

  return () => {
    offEarned();
    offClosed();
  };
}

// ─── Interstitial Ad ───────────────────────────────────────────────────────
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

  const ad =
    cachedInterstitial ??
    InterstitialAd.createForAdRequest(
      AD_IDS.useTest ? TestIds.INTERSTITIAL : AD_IDS.interstitial,
      { requestNonPersonalizedAdsOnly: false, keywords: ["games", "strategy"] },
    );

  cachedInterstitial = null;

  const off = ad.addAdEventListener(AdEventType.CLOSED, () => {
    off();
    opts.onClosed?.();
    setTimeout(_preloadInterstitial, 1_000);
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    off();
    opts.onClosed?.();
  });

  const tryShow = () => {
    ad.show().catch(() => {
      off();
      opts.onClosed?.();
    });
  };

  if (ad.loaded) {
    tryShow();
  } else {
    ad.addAdEventListener(AdEventType.LOADED, tryShow);
    ad.load();
  }
}

// ─── Simulação (Expo Go / Web) ─────────────────────────────────────────────
const SIM_MS = 3_800;

function _simulateRewarded(
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
