# 🚀 Empire Clash — Guia de Build para Google Play Store

## Pré-requisitos

1. **Conta Expo (EAS)** — crie em https://expo.dev
2. **EAS CLI** instalado globalmente:
   ```bash
   npm install -g eas-cli
   ```
3. **Login no EAS:**
   ```bash
   eas login
   ```

---

## 📁 Estrutura de Assets

Os assets obrigatórios já existem em:
```
assets/
  icon.png           — ícone do app (1024×1024 px recomendado)
  splash.png         — tela de splash (2048×2048 px recomendado)
  adaptive-icon.png  — ícone adaptativo Android (1024×1024 px)
```

> Para a Play Store, substitua por imagens de alta qualidade antes do build de produção.

---

## ⚙️ Configuração Inicial (uma vez só)

Dentro da pasta `artifacts/empire-clash/`, execute:

```bash
cd artifacts/empire-clash
eas build:configure
```

Isso vinculará o projeto à sua conta Expo e criará um `projectId` em `app.json`.

---

## 🔨 Gerar APK de Teste (preview)

```bash
cd artifacts/empire-clash
eas build --platform android --profile preview
```

Gera um `.apk` para instalar diretamente no dispositivo ou emulador.

---

## 📦 Gerar AAB para Play Store (produção)

```bash
cd artifacts/empire-clash
eas build --platform android --profile production
```

Gera um `.aab` (Android App Bundle) pronto para upload na Google Play Store.

---

## 🏪 Enviar Direto para a Play Store

Após ter o `play-service-account.json` da Google:

```bash
cd artifacts/empire-clash
eas submit --platform android --profile production
```

---

## 📋 Informações do App

| Campo             | Valor                          |
|-------------------|--------------------------------|
| Nome              | Empire Clash                   |
| Slug              | empire-clash                   |
| Versão            | 1.0.0                          |
| Android Package   | com.hadrian.empireclash         |
| iOS Bundle ID     | com.hadrian.empireclash         |
| Min SDK Android   | 24 (Android 7.0+)              |
| Target SDK        | 35 (Android 15)                |
| Orientação        | Portrait only                  |

---

## 🔐 Chaves de Assinatura

O EAS gerencia as chaves de assinatura automaticamente na nuvem.
Para usar suas próprias chaves, consulte: https://docs.expo.dev/app-signing/managed-credentials/

---

## 📱 AdMob — Antes de Publicar

Substitua os IDs de teste em `app.json` → `extra.admob`:

```json
"admob": {
  "androidAppId": "ca-app-pub-SEU_ID~SEU_APP_ID",
  "rewardedAndroid": "ca-app-pub-SEU_ID/SEU_AD_UNIT",
  "interstitialAndroid": "ca-app-pub-SEU_ID/SEU_AD_UNIT",
  "useTestAds": false
}
```

---

## ✅ Checklist antes de publicar

- [ ] Ícones substituídos por imagens de alta qualidade (1024×1024px)
- [ ] IDs de produção do AdMob configurados
- [ ] `useTestAds: false` em `app.json`
- [ ] `projectId` do EAS configurado em `app.json → extra.eas`
- [ ] `play-service-account.json` gerado no Google Cloud Console
- [ ] Screenshots do app tiradas para a Play Store (min. 2)
- [ ] Descrição e categoria definidas no Console da Play Store
