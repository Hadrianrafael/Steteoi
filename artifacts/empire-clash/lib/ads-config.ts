import Constants from "expo-constants";
import { Platform } from "react-native";

type AdMobConfig = {
  androidAppId: string;
  iosAppId: string;
  rewardedAndroid: string;
  interstitialAndroid: string;
  useTestAds: boolean;
};

type UnityAdsConfig = {
  androidGameId: string;
  iosGameId: string;
  rewardedAndroidPlacement: string;
  interstitialAndroidPlacement: string;
  useTestAds: boolean;
};

function getExtra<T>(key: string): T | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  return extra?.[key] as T | undefined;
}

export const AdConfig = {
  admob: getExtra<AdMobConfig>("admob") ?? {
    androidAppId: "ca-app-pub-3940256099942544~3347511713",
    iosAppId: "ca-app-pub-3940256099942544~3347511713",
    rewardedAndroid: "ca-app-pub-3940256099942544/5224354917",
    interstitialAndroid: "ca-app-pub-3940256099942544/1033173712",
    useTestAds: true,
  },
  unityAds: getExtra<UnityAdsConfig>("unityAds") ?? {
    androidGameId: "1234567",
    iosGameId: "1234568",
    rewardedAndroidPlacement: "Rewarded_Android",
    interstitialAndroidPlacement: "Interstitial_Android",
    useTestAds: true,
  },
};

export function getAndroidAdMobAppId() {
  return Platform.OS === "android" ? AdConfig.admob.androidAppId : AdConfig.admob.iosAppId;
}

export function getAndroidUnityGameId() {
  return Platform.OS === "android" ? AdConfig.unityAds.androidGameId : AdConfig.unityAds.iosGameId;
}
