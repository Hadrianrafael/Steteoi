# Empire Clash — Play Store Checklist

## Package & Identidade

- [x] Package: `com.hadrian.empireclash`
- [x] App Name: "Empire Clash"
- [x] Version: 1.0.0 / versionCode: 1
- [x] Orientation: portrait
- [x] userInterfaceStyle: dark
- [x] scheme: empireclash (deep links)
- [x] description: texto completo em pt-BR

## Ícones & Visual

- [x] icon.png (principal) em `assets/icon.png`
- [x] adaptive-icon.png em `assets/adaptive-icon.png`
- [x] backgroundColor adaptive icon: `#0f172a`
- [x] splash screen configurado com resizeMode contain
- [x] splash backgroundColor: `#0f172a`
- [ ] **AÇÃO**: Criar ícone 512x512 finalizado em alta resolução
- [ ] **AÇÃO**: Criar splash screen com logo Empire Clash
- [ ] Feature graphic 1024x500 para Play Store
- [ ] Screenshots (mínimo 2, recomendado 8): portrait 1080x1920

## Android SDK

- [x] compileSdkVersion: 35
- [x] targetSdkVersion: 35 (obrigatório a partir de ago/2025)
- [x] minSdkVersion: 24 (Android 7.0+, cobre 95%+ dispositivos)
- [x] enableProguardInReleaseBuilds: true
- [x] enableShrinkResourcesInReleaseBuilds: true
- [x] enableHermes: true (obrigatório para performance)
- [x] newArchEnabled: true (New Architecture React Native)

## Permissões Android

- [x] INTERNET
- [x] ACCESS_NETWORK_STATE
- [x] VIBRATE (haptic feedback)
- [x] com.google.android.gms.permission.AD_ID (AdMob)
- [x] com.android.vending.BILLING (compras futuras)
- [x] Bloqueadas: LOCATION, CAMERA, AUDIO, STORAGE (não necessárias)

## AdMob

- [x] App ID: `ca-app-pub-1752902298077786~3887343530`
- [x] Rewarded ID: `ca-app-pub-1752902298077786/8272251612`
- [x] Interstitial ID: `ca-app-pub-1752902298077786/8252070315`
- [x] useTestAds: false (produção)
- [x] NSUserTrackingUsageDescription (iOS ATT)
- [x] SKAdNetworkItems (iOS)
- [ ] **AÇÃO EAS**: `pnpm add react-native-google-mobile-ads`
- [ ] **AÇÃO EAS**: Adicionar plugin react-native-google-mobile-ads em app.json
- [ ] Verificar conta AdMob aprovada e anúncios ativos

## Google Play Games

- [ ] Ativar Google Play Games API no Play Console
- [ ] Criar ID do jogo no Play Console > Serviços de jogos
- [ ] Obter webClientId do OAuth e atualizar googlePlayGames.ts
- [ ] **AÇÃO EAS**: `pnpm add @react-native-google-signin/google-signin`
- [ ] **AÇÃO EAS**: Adicionar plugin em app.json
- [ ] SHA-1 da chave de release registrada no Google Cloud Console

## EAS Build

- [x] eas.json com perfis: development, preview, production
- [x] production: buildType app-bundle, gradleCommand :app:bundleRelease
- [x] autoIncrement: true (versionCode automático)
- [ ] `eas.json` extra.eas.projectId: substituir por ID real do projeto Expo
- [ ] Conta EAS configurada com `eas login`
- [ ] Keystore criada/importada no EAS

## Conteúdo Play Store

- [ ] Título: "Empire Clash" (30 chars max)
- [ ] Descrição curta (80 chars): "Conquiste territórios em batalhas aéreas de estratégia em tempo real!"
- [ ] Descrição completa (4000 chars): mencionar jatos reais, cartas, missões, ranking, AdMob
- [ ] Categoria: Jogos > Estratégia
- [ ] Tags: estratégia, aviões, conquista, offline, jatos
- [ ] Classificação de conteúdo: completar questionário (≥ PEGI 7 recomendado)
- [ ] Privacy Policy URL (obrigatório para jogos com publicidade)
- [ ] Email de suporte válido

## Segurança & Conformidade

- [x] ProGuard ativo (ofusca código em release)
- [x] Hermes ativo (melhora performance e tamanho APK)
- [ ] Não hardcode credenciais de produção visíveis no código
- [ ] GDPR / LGPD: implementar CMP se necessário para anúncios personalizados
- [ ] Verificar Data Safety section no Play Console

## Performance

- [x] react-native-reanimated 4.x (UI thread animations)
- [x] AsyncStorage para save local (sem dependência de servidor)
- [x] Offline-first: jogo funciona sem internet
- [ ] Testar em dispositivo físico (mínimo Android 7.0)
- [ ] Verificar uso de memória < 200MB
- [ ] Verificar tamanho final do AAB < 150MB

## Assinatura

- [ ] Keystore gerada ou importada no EAS
- [ ] Usar EAS Managed Credentials (recomendado) ou Upload Key própria
- [ ] SHA-1 registrado no Firebase/Google Cloud se necessário

## Comandos Finais

```bash
# 1. Instalar dependências nativas para build
pnpm --filter @workspace/empire-clash add react-native-google-mobile-ads
pnpm --filter @workspace/empire-clash add @react-native-google-signin/google-signin

# 2. Atualizar plugins em app.json (ver ADMOB_SETUP.md)

# 3. Build de produção
cd artifacts/empire-clash
npx eas build -p android --profile production

# 4. Submit para Play Store (após aprovação do AAB)
npx eas submit -p android --profile production
```
