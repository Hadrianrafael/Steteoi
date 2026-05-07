# Empire Clash — Play Store Checklist

## Package & Identidade

- [x] Package: `com.hadrian.empireclash`
- [x] App Name: "Empire Clash"
- [x] Version: 1.0.0 / versionCode: 1
- [x] Orientation: portrait
- [x] userInterfaceStyle: dark
- [x] scheme: empireclash (deep links)

---

## SDK & Build

- [x] Expo SDK 54 / React Native 0.81.5
- [x] Min SDK: 24 (Android 7.0 — cobre 96%+ dos dispositivos)
- [x] Target SDK: 35 (Android 15)
- [x] Compile SDK: 35
- [x] New Architecture habilitada (`newArchEnabled: true`)
- [x] Hermes habilitado (`enableHermes: true`)
- [x] ProGuard em release (`enableProguardInReleaseBuilds: true`)
- [x] Shrink resources em release (`enableShrinkResourcesInReleaseBuilds: true`)
- [x] React Compiler habilitado (`reactCompiler: true`)
- [x] Metro: `inlineRequires: true` (boot mais rápido)
- [x] EAS Build configurado com 3 profiles (development / preview / production)
- [x] Auto-increment de versionCode no profile production

---

## AdMob

- [x] SDK instalado: `react-native-google-mobile-ads`
- [x] Plugin configurado em `app.json`
- [x] App ID Android: `ca-app-pub-1752902298077786~3887343530`
- [x] Rewarded Ad ID: `ca-app-pub-1752902298077786/8272251612`
- [x] Interstitial Ad ID: `ca-app-pub-1752902298077786/8252070315`
- [x] `useTestAds: false` (anúncios reais de produção)
- [x] `delay_app_measurement_init: true` (aguarda consent)
- [x] Consent LGPD/GDPR via UMP (AdsConsent.requestInfoUpdate)
- [x] Pré-carregamento de rewarded e interstitial no boot
- [x] Reload automático após exibição (cachedRewarded / cachedInterstitial)
- [x] Fallback para simulação em Expo Go / web
- [ ] **TODO:** Verificar no AdMob Console que o app está ativo

---

## Permissões Android

- [x] `INTERNET`
- [x] `ACCESS_NETWORK_STATE`
- [x] `VIBRATE`
- [x] `com.google.android.gms.permission.AD_ID`
- [x] `com.android.vending.BILLING`
- [x] Permissões bloqueadas: câmera, localização, armazenamento, microfone

---

## Assets Visuais

- [x] Ícone 1024×1024 (F-22 dourado com afterburner e coroa)
- [x] Adaptive icon com foreground e background separados
- [x] Splash screen cinematográfica (formação de jatos + EMPIRE CLASH)
- [x] Feature graphic 1024×500 (banner Play Store)
- [x] Screenshot 1: Menu principal (em português)
- [x] Screenshot 2: Arsenal de aviões (6 jatos com stats)
- [x] Screenshot 3: Batalha em progresso (ATACAR/DEFENDER)

---

## Sistemas de Jogo

- [x] 6 aviões com SVGs vetoriais: F-15, F-16, F-22, SU-57, Rafale, Gripen
- [x] Sistema de cartas com raridades (comum/raro/épico/lendário)
- [x] Sistema de missões com recompensas
- [x] Recompensas offline (máx. 8h calculadas no boot)
- [x] Energia máxima: 30 (recupera 1 a cada 10min)
- [x] Daily login com sequência e recompensas crescentes
- [x] XP e níveis de comandante
- [x] Sistema de fragmentos/figurinhas para evoluir aviões
- [x] Haptic feedback em todos os pontos chave
- [x] WelcomeScreen de onboarding (primeira vez)
- [x] LoadingScreen animada com jatos e barra de progresso
- [x] Google Play Games (serviço pronto, mock em dev)

---

## Monetização

- [x] Anúncios rewarded (energia extra, continuar batalha)
- [x] Anúncios interstitial (entre sessões de jogo)
- [x] Sistema de moedas e gemas (base para IAPs futuros)
- [x] Loja integrada na UI

---

## Compliance Play Store

- [x] Sem permissões desnecessárias
- [x] Sem acesso a localização
- [x] Consentimento LGPD/GDPR implementado
- [x] `NSUserTrackingUsageDescription` para iOS (futuro)
- [x] Nenhuma coleta de dados pessoais além do nome de comandante (local)
- [ ] **TODO:** Publicar política de privacidade em URL pública
- [ ] **TODO:** Preencher questionário de classificação etária no Play Console
- [ ] **TODO:** Preencher seção de anúncios de dados no Play Console

---

## Último passo: EAS Build

```bash
cd artifacts/empire-clash
npm install -g eas-cli   # se não tiver instalado
eas login                 # login na conta Expo
eas init                  # vincular projeto
eas credentials           # configurar keystore Android
eas build -p android --profile production
```
