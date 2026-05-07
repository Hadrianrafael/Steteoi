/**
 * Web stub for react-native-google-mobile-ads.
 * Metro substitutes this file when bundling for web so the native-only
 * module never enters the web bundle.
 */

export default function MobileAds() {
  return {
    initialize: () => Promise.resolve(),
    setRequestConfiguration: () => Promise.resolve(),
  };
}

export const AdsConsent = {
  requestInfoUpdate: () =>
    Promise.resolve({ status: "NOT_REQUIRED", isConsentFormAvailable: false }),
  showForm: () => Promise.resolve({ status: "NOT_REQUIRED" }),
};

export const AdsConsentStatus = {
  UNKNOWN: "UNKNOWN",
  REQUIRED: "REQUIRED",
  NOT_REQUIRED: "NOT_REQUIRED",
  OBTAINED: "OBTAINED",
};

export const AdsConsentDebugGeography = {
  DISABLED: 0,
  EEA: 1,
  NOT_EEA: 2,
};

export const TestIds = {
  BANNER: "ca-app-pub-3940256099942544/6300978111",
  INTERSTITIAL: "ca-app-pub-3940256099942544/1033173712",
  REWARDED: "ca-app-pub-3940256099942544/5224354917",
  REWARDED_INTERSTITIAL: "ca-app-pub-3940256099942544/5354046379",
};

export const AdEventType = {
  LOADED: "loaded",
  ERROR: "error",
  OPENED: "opened",
  CLICKED: "clicked",
  CLOSED: "closed",
};

export const RewardedAdEventType = {
  LOADED: "loaded",
  EARNED_REWARD: "earned_reward",
};

const noop = () => () => {};

export const BannerAd = { createForAdRequest: () => ({ load: noop, addAdEventListener: noop }) };

export const InterstitialAd = {
  createForAdRequest: () => ({
    load: noop,
    show: () => Promise.resolve(),
    addAdEventListener: () => () => {},
    loaded: false,
  }),
};

export const RewardedAd = {
  createForAdRequest: () => ({
    load: noop,
    show: () => Promise.resolve(),
    addAdEventListener: () => () => {},
    loaded: false,
  }),
};

export const RewardedInterstitialAd = {
  createForAdRequest: () => ({
    load: noop,
    show: () => Promise.resolve(),
    addAdEventListener: () => () => {},
    loaded: false,
  }),
};

export const MaxAdContentRating = {
  G: "G",
  PG: "PG",
  T: "T",
  MA: "MA",
};
