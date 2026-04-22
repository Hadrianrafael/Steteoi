import Constants from "expo-constants";
import { Platform } from "react-native";

type AdMobConfig = {
  androidAppId: string;
  iosAppId: string;
  rewardedAndroid: string;
  interstitialAndroid: string;
  useTestAds: boolean;
};

const TEST_REWARDED = "ca-app-pub-3940256099942544/5224354917";
const TEST_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";

function cfg(): AdMobConfig {
  const extra = (Constants.expoConfig?.extra ?? {}) as { admob?: AdMobConfig };
  return (
    extra.admob ?? {
      androidAppId: "",
      iosAppId: "",
      rewardedAndroid: "",
      interstitialAndroid: "",
      useTestAds: true,
    }
  );
}

export function getRewardedUnitId(): string {
  const c = cfg();
  if (c.useTestAds) return TEST_REWARDED;
  return Platform.OS === "android" ? c.rewardedAndroid : TEST_REWARDED;
}

export function getInterstitialUnitId(): string {
  const c = cfg();
  if (c.useTestAds) return TEST_INTERSTITIAL;
  return Platform.OS === "android" ? c.interstitialAndroid : TEST_INTERSTITIAL;
}

export type AdReward = { type: "coins" | "gems" | "energy"; amount: number };

/**
 * Show a rewarded video ad. In dev/web builds this is mocked.
 * On production Android builds, integrate `react-native-google-mobile-ads`:
 *
 *   import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
 *   const ad = RewardedAd.createForAdRequest(getRewardedUnitId());
 *   ad.addAdEventListener(RewardedAdEventType.LOADED, () => ad.show());
 *   ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => onReward());
 *   ad.load();
 */
export async function showRewardedAd(reward: AdReward): Promise<AdReward | null> {
  await new Promise((r) => setTimeout(r, 4000));
  return reward;
}

/**
 * Show an interstitial ad between matches.
 * Frequency-capped to once per 3 minutes to avoid annoying users.
 */
let lastInterstitial = 0;
export async function showInterstitialAd(): Promise<void> {
  const now = Date.now();
  if (now - lastInterstitial < 3 * 60 * 1000) return;
  lastInterstitial = now;
  await new Promise((r) => setTimeout(r, 1500));
}
