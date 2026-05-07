# AdMob Setup — Empire Clash

## IDs de Producao (Reais)

| Recurso         | ID                                               |
|-----------------|--------------------------------------------------|
| App ID Android  | `ca-app-pub-1752902298077786~3887343530`         |
| Rewarded Video  | `ca-app-pub-1752902298077786/8272251612`         |
| Interstitial    | `ca-app-pub-1752902298077786/8252070315`         |

## Comportamento por Ambiente

| Ambiente        | Comportamento                               |
|-----------------|---------------------------------------------|
| Web / Expo Go   | Simula anuncio com timer de 3.8s (no-SDK)   |
| EAS Dev Build   | SDK nativo, IDs de teste automáticos        |
| EAS Production  | SDK nativo, IDs de producao reais           |

## Como Ativar o SDK Nativo (para EAS Build)

### 1. Instalar o pacote

```bash
pnpm --filter @workspace/empire-clash add react-native-google-mobile-ads
```

### 2. Adicionar plugin em app.json

Editar `artifacts/empire-clash/app.json`, na secao `"plugins"`:

```json
"plugins": [
  ["expo-router", { "origin": "https://replit.com/" }],
  "expo-font",
  "expo-web-browser",
  [
    "expo-build-properties",
    {
      "android": {
        "compileSdkVersion": 35,
        "targetSdkVersion": 35,
        "minSdkVersion": 24,
        "enableProguardInReleaseBuilds": true,
        "enableShrinkResourcesInReleaseBuilds": true,
        "enableHermes": true,
        "useFrameworks": "static"
      }
    }
  ],
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-1752902298077786~3887343530",
      "iosAppId": "ca-app-pub-1752902298077786~3887343530"
    }
  ]
]
```

> ATENCAO: Nao adicione o plugin sem instalar o pacote — causara crash no dev server.

### 3. Verificar configuracao em services/admob.ts

O arquivo ja esta configurado com os IDs corretos e fallback automatico.
Nao altere os IDs de producao.

### 4. Executar EAS Build

```bash
cd artifacts/empire-clash
npx eas build -p android --profile production
```

## Onde os Anuncios sao Exibidos

| Local                  | Tipo          | Gatilho                             |
|------------------------|---------------|-------------------------------------|
| Tela pos-partida       | Rewarded      | Botao "dobrar moedas"               |
| Arsenal — upgrade      | Rewarded      | Sem moedas suficientes              |
| Arsenal — desbloquear  | Rewarded      | Sem moedas suficientes              |
| Recompensa offline     | Rewarded      | Botao "dobrar tudo 2x"              |
| Recuperar energia      | Rewarded      | Energia = 0                         |

## Testar Anuncios em Dev Build

Para testar sem usar os IDs de producao:

1. Em `app.json`, setar `"useTestAds": true` temporariamente
2. O servico `services/admob.ts` usa `TestIds.REWARDED` e `TestIds.INTERSTITIAL` automaticamente
3. Reverter para `false` antes do build de producao

## Logs e Debug

O servico loga erros com `console.warn("[AdMob] ...")`.
Monitore o Logcat no Android Studio ou use `eas build --profile development`
com adb logcat para ver os logs em tempo real.

## Conta AdMob

- URL: https://admob.google.com
- App registrado: Empire Clash (Android)
- Status: verificar se a conta esta ativa e pagamentos configurados
- Minimo de pagamento: $100 USD por ciclo de faturamento

## Conformidade LGPD/GDPR

Para usuarios na UE, considerar implementar CMP (Consent Management Platform):

```bash
pnpm add react-native-google-mobile-ads  # inclui suporte a UMP SDK
```

Adicionar ao inicializar AdMob:
```typescript
// Em services/admob.ts, apos initialize():
await mobileAds().requestTrackingPermissionIfNecessary(); // iOS
// UMP SDK para GDPR/LGPD sera chamado automaticamente
```
