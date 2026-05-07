import Constants from "expo-constants";
import { Platform } from "react-native";

type AdMobConfig = {
  androidAppId: string;
  iosAppId: string;
  rewardedAndroid: string;
  interstitialAndroid: string;
  useTestAds: boolean;
};

function getExtra<T>(key: string): T | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  return extra?.[key] as T | undefined;
}

// Real production AdMob IDs for Empire Clash
const REAL_IDS: AdMobConfig = {
  androidAppId:     "ca-app-pub-1752902298077786~3887343530",
  iosAppId:         "ca-app-pub-1752902298077786~3887343530",
  rewardedAndroid:  "ca-app-pub-1752902298077786/8272251612",
  interstitialAndroid: "ca-app-pub-1752902298077786/8252070315",
  useTestAds: false,
};

export const AdConfig = {
  admob: getExtra<AdMobConfig>("admob") ?? REAL_IDS,
};

export function getAndroidAdMobAppId() {
  return Platform.OS === "android"
    ? AdConfig.admob.androidAppId
    : AdConfig.admob.iosAppId;
}
