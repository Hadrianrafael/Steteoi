# Empire Clash — Guia de Build para Google Play Store

## Visão Geral

- **Package:** `com.hadrian.empireclash`
- **SDK Expo:** 54
- **React Native:** 0.81.5
- **AdMob App ID:** `ca-app-pub-1752902298077786~3887343530`
- **Build:** AAB via EAS Build (`:app:bundleRelease`)

---

## Pré-requisitos

```bash
npm install -g eas-cli
eas login
```

---

## 1. Configurar AdMob para Build Nativa

O `react-native-google-mobile-ads` usa dynamic require em dev (sem instalar).
Para o build nativo, instale e adicione o plugin:

```bash
# 1. Instalar o SDK nativo do AdMob
pnpm --filter @workspace/empire-clash add react-native-google-mobile-ads

# 2. Adicionar plugin em app.json (dentro de "plugins"):
# [
#   "react-native-google-mobile-ads",
#   {
#     "androidAppId": "ca-app-pub-1752902298077786~3887343530",
#     "iosAppId": "ca-app-pub-1752902298077786~3887343530"
#   }
# ]
```

### IDs AdMob de Producao

| Tipo          | ID                                               |
|---------------|--------------------------------------------------|
| App ID        | `ca-app-pub-1752902298077786~3887343530`         |
| Rewarded      | `ca-app-pub-1752902298077786/8272251612`         |
| Interstitial  | `ca-app-pub-1752902298077786/8252070315`         |

---

## 2. Configurar Google Play Games (multiplayer futuro)

```bash
pnpm --filter @workspace/empire-clash add @react-native-google-signin/google-signin

# Adicionar em app.json plugins:
# ["@react-native-google-signin/google-signin", {"iosUrlScheme": "..."}]
```

Configurar OAuth no Google Play Console -> Servicos de jogos -> Autenticacao.

---

## 3. Build de Producao (AAB para Play Store)

```bash
# Na pasta do projeto
cd artifacts/empire-clash

# Build AAB de producao — gera .aab pronto para a Play Store
npx eas build -p android --profile production
```

## 4. Build de Preview (APK para teste interno)

```bash
npx eas build -p android --profile preview
```

## 5. Build de Desenvolvimento

```bash
npx eas build -p android --profile development
```

---

## 6. Submit para Play Store (automatico)

```bash
# Coloque sua service account key em:
# artifacts/empire-clash/play-service-account.json

npx eas submit -p android --profile production
```

---

## 7. Checklist para Play Store

- [ ] AdMob App ID configurado em AndroidManifest via plugin
- [ ] `useTestAds: false` em app.json extra.admob
- [ ] `versionCode` incrementado no app.json
- [ ] Icone 512x512 em assets/icon.png
- [ ] Splash screen configurada
- [ ] ProGuard ativado (enableProguardInReleaseBuilds: true)
- [ ] Hermes ativado (enableHermes: true)
- [ ] Min SDK 24, Target SDK 35
- [ ] Package: com.hadrian.empireclash
- [ ] Play Store listing preenchido (titulo, descricao, screenshots)
- [ ] Privacy Policy URL configurada
- [ ] Content rating definido (PEGI 3 ou similar)

---

## 8. Estrutura de Servicos

```
services/
  admob.ts           — AdMob rewarded/interstitial (producao + simulacao dev)
  googlePlayGames.ts — Login Google Play, achievements, leaderboards

lib/
  admob.ts           — Wrapper (mantido por compatibilidade com telas existentes)
  ads-config.ts      — IDs e configuracao centralizada

components/jets/
  JetSvg.tsx         — SVG silhouettes: F-16, F-15, Rafale, Su-57, F-22, Gripen
```

---

## 9. Notas Importantes

- Em dev/web: AdMob simula com timer de 3.8s (sem SDK nativo necessario)
- Em build nativa: AdMob usa IDs reais de producao
- Google Play Games: Login real so funciona com build nativa + configuracao OAuth
- Metro blockList: bloqueia `.local/` e `node_modules/.cache/` para evitar crash no Replit
- `@expo/cli 54.0.24` e nao `54.0.33` (versao inexistente no registry)
