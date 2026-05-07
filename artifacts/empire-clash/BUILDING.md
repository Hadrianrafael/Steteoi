# Empire Clash — Guia de Build & Publicação

## Informações do app

- **Package:** `com.hadrian.empireclash`
- **SDK Expo:** 54 / React Native 0.81.5
- **AdMob App ID:** `ca-app-pub-1752902298077786~3887343530`
- **Min SDK:** 24 (Android 7.0+) · **Target SDK:** 35
- **Hermes:** ✅ · **ProGuard:** ✅ · **Shrink Resources:** ✅

---

## Pré-requisitos

1. **Conta Expo** — https://expo.dev (gratuita)
2. **EAS CLI instalado globalmente:**
   ```bash
   npm install -g eas-cli
   ```
3. **Login no EAS:**
   ```bash
   eas login
   ```
4. **Conta Google Play Console** — https://play.google.com/console

---

## Configuração inicial (única vez)

### 1. Vincular projeto ao EAS

```bash
cd artifacts/empire-clash
eas init
# Aceitar criar novo projeto ou vincular existente
```

### 2. Configurar assinatura Android

```bash
eas credentials
# Escolha: Android → production → Keystore → Create new keystore
# SALVE a keystore.jks e as senhas em local seguro!
```

---

## Builds

### Development (debug APK — testar no celular)

```bash
eas build -p android --profile development
```

### Preview (release APK — para testers)

```bash
eas build -p android --profile preview
```

### Production (AAB — Google Play) ⭐

```bash
eas build -p android --profile production
```

O AAB final estará em: `https://expo.dev/accounts/<user>/projects/empire-clash/builds`

Tamanho esperado: **50–80 MB** (Hermes + ProGuard + shrink resources)

---

## AdMob — Verificação

O SDK `react-native-google-mobile-ads` já está instalado e configurado via plugin em `app.json`.

**IDs de Produção:**

| Tipo | ID |
|------|----|
| App | `ca-app-pub-1752902298077786~3887343530` |
| Rewarded | `ca-app-pub-1752902298077786/8272251612` |
| Interstitial | `ca-app-pub-1752902298077786/8252070315` |

**Verificar no AdMob Console:**
- https://admob.google.com → Apps → `com.hadrian.empireclash`
- Confirmar que os ad units estão `Ativos`
- A inicialização + consent LGPD/GDPR acontece automaticamente no boot

---

## Upload na Google Play

### Opção A — Via EAS Submit (automático)

```bash
# Gerar service account no Google Play Console:
# Setup → API Access → Create service account → Baixar JSON
# Salvar como play-service-account.json na raiz do projeto

eas submit -p android --latest
```

### Opção B — Manual

1. Baixar o `.aab` da dashboard do EAS
2. Google Play Console → `Versões do app` → `Teste interno`
3. Nova versão → Upload → Preencher notas em pt-BR
4. Revisar e publicar

---

## Assets prontos (`assets/`)

| Arquivo | Uso | Status |
|---------|-----|--------|
| `icon.png` | Ícone principal (1024×1024) | ✅ Gerado |
| `adaptive-icon.png` | Adaptive icon Android | ✅ Gerado |
| `splash.png` | Splash screen (9:16) | ✅ Gerado |
| `feature-graphic.png` | Banner Play Store (1024×500) | ✅ Gerado |
| `screenshot-1-menu.png` | Screenshot — Menu principal | ✅ Gerado |
| `screenshot-2-arsenal.png` | Screenshot — Arsenal de aviões | ✅ Gerado |
| `screenshot-3-battle.png` | Screenshot — Batalha em progresso | ✅ Gerado |

---

## Checklist final pré-publicação

- [ ] `eas login` executado
- [ ] `eas init` vinculado ao projeto
- [ ] `eas credentials` — keystore configurada
- [ ] `eas build -p android --profile production` — build gerado com sucesso
- [ ] AAB baixado e tamanho verificado (< 150 MB)
- [ ] AdMob Console: `com.hadrian.empireclash` vinculado e ad units ativos
- [ ] Play Console: classificação etária preenchida
- [ ] Play Console: política de privacidade publicada
- [ ] Screenshots e feature graphic enviadas
- [ ] Descrição completa em pt-BR preenchida
