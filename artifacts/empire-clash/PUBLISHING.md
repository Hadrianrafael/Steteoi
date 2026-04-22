# Publicação na Google Play Store — Empire Clash

Este documento é o passo-a-passo definitivo para colocar o Empire Clash no ar.

## Pré-requisitos (uma vez)

1. **Conta Google Play Console** — US$ 25 (taxa única) em
   https://play.google.com/console/signup
2. **Conta Expo (EAS)** grátis — https://expo.dev/signup
3. **Conta AdMob** — https://admob.google.com (para anúncios)
4. **Hospedar a Política de Privacidade** (`PRIVACY_POLICY.md` deste repo)
   em uma URL pública. Você pode publicar como página estática no Replit
   Deploy, GitHub Pages ou Notion público.

## 1. Configurar o EAS

```bash
cd artifacts/empire-clash
npx eas-cli login
npx eas-cli init --id <criar novo projeto na conta Expo>
```

O comando acima preenche `extra.eas.projectId` em `app.json`.
Edite `owner` em `app.json` com o seu username do Expo.

## 2. Configurar AdMob

1. Crie um app Android no AdMob → copie o **App ID**.
2. Crie 2 unidades de anúncio:
   - **Recompensado** (Rewarded) — para a aba "Grátis" da loja.
   - **Intersticial** (Interstitial) — para mostrar entre partidas.
3. Edite `app.json` → `extra.admob` com os IDs reais.
4. Mude `useTestAds` para `false` quando estiver pronto pra produção.
5. Instale o SDK na build de produção:
   ```bash
   pnpm add react-native-google-mobile-ads
   ```
   E adicione o plugin em `app.json` → `plugins`:
   ```json
   ["react-native-google-mobile-ads", {
     "androidAppId": "ca-app-pub-XXXXX~XXXXX"
   }]
   ```

## 3. Configurar Compras no App (IAP)

1. No Play Console → seu app → **Monetizar > Produtos > Produtos no app**.
2. Crie cada SKU exatamente como aparece em `lib/iap.ts`:
   - `coins_500`, `coins_1500`, `coins_5000`, `coins_15000`
   - `gems_30`, `gems_90`, `gems_300`, `gems_1000`
   - `combo_war`, `combo_fleet`
3. Para o **VIP**: **Monetizar > Assinaturas** → SKU `vip_monthly`.
4. Instale o SDK:
   ```bash
   pnpm add react-native-iap
   ```
5. Substitua o stub em `lib/iap.ts` `purchaseProduct` pela chamada real
   (instruções no comentário do arquivo).

## 4. Gerar APK de teste

```bash
cd artifacts/empire-clash
npx eas-cli build --platform android --profile preview
```

Você recebe um link com o `.apk` para instalar direto no celular e testar.

## 5. Gerar AAB de produção (Play Store)

```bash
npx eas-cli build --platform android --profile production
```

Faça o download do `.aab` ao final.

## 6. Submeter à Play Store

### Manual (primeira vez recomendado)

1. Play Console → **Criar aplicativo** → Empire Clash, Português (Brasil).
2. **Configuração do app:**
   - Política de privacidade (URL pública)
   - Acesso ao app (sem login obrigatório)
   - Anúncios: **Sim, contém anúncios**
   - Classificação de conteúdo: preencher questionário (estratégia, sem
     violência gráfica → provável Livre/10+)
   - Público-alvo: 13+
   - Segurança de dados: declarar Advertising ID + dados de compra
3. **Loja > Ficha principal:** ícone 512×512, screenshots (mínimo 2),
   descrição curta e completa.
4. **Versão de produção:** subir o `.aab` gerado.
5. Enviar para análise (geralmente 1–7 dias).

### Automatizado via EAS Submit

```bash
# Coloque a service account JSON em artifacts/empire-clash/play-service-account.json
npx eas-cli submit --platform android --profile production
```

Como gerar a service account: Play Console → **Configurações > Acesso à
API** → Vincular projeto Google Cloud → criar conta de serviço com
permissão "Liberar para canais de produção".

## 7. Atualizações futuras

```bash
# Mudanças só de JS/assets (sem código nativo): updates OTA
npx eas-cli update --branch production --message "fix: balanceamento"

# Mudanças em deps nativas: nova build + envio
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production
```

## Checklist final antes de publicar

- [ ] `app.json` → `owner` e `extra.eas.projectId` preenchidos
- [ ] `app.json` → `extra.admob` com IDs reais e `useTestAds: false`
- [ ] Política de privacidade hospedada e URL no Play Console
- [ ] Ícone 1024×1024 e screenshots em `assets/store/`
- [ ] Texto da loja revisado (PT-BR)
- [ ] Testado em pelo menos 1 dispositivo Android real (APK preview)
- [ ] Backup do keystore gerado pelo EAS (`eas credentials`)
