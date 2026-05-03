# Unity Ads Setup

This project is prepared to store Unity Ads configuration in `app.json` under `extra.unityAds`.

## Expected keys

```json
"unityAds": {
  "androidGameId": "YOUR_ANDROID_GAME_ID",
  "iosGameId": "YOUR_IOS_GAME_ID",
  "rewardedAndroidPlacement": "YOUR_REWARDED_PLACEMENT",
  "interstitialAndroidPlacement": "YOUR_INTERSTITIAL_PLACEMENT",
  "useTestAds": true
}
```

## Before publishing

- Replace test IDs with production IDs from Unity Dashboard
- Keep `useTestAds: true` while testing
- Switch it to `false` before Play Store submission
- Make sure your ad placements match the IDs used in Unity
