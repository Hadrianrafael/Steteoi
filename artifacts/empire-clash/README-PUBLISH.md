# Empire Clash — Publish Checklist

## GitHub
Commit these files:
- `app.json`
- `eas.json`
- `App.tsx`
- `assets/icon.png`
- `assets/splash.png`
- `assets/adaptive-icon.png`
- `lib/ads-config.ts`
- `unity-ads.md`
- `BUILDING.md`

## AdMob
Fill in `app.json -> extra.admob`:
- `androidAppId`
- `iosAppId`
- `rewardedAndroid`
- `interstitialAndroid`
- set `useTestAds: false` for production

## Unity Ads
Fill in `app.json -> extra.unityAds`:
- `androidGameId`
- `iosGameId`
- `rewardedAndroidPlacement`
- `interstitialAndroidPlacement`
- set `useTestAds: false` for production

## EAS Build
Use this in your own terminal:
```bash
cd artifacts/empire-clash
eas build:configure
eas build --platform android --profile production
```

The build link will appear in your EAS dashboard after the command starts.
