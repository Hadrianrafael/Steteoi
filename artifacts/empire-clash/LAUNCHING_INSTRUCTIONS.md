# Empire Clash - Instruções para Lançamento na Play Store

## Status Atual
✅ **AdMob**: Totalmente configurado e pronto para produção
✅ **Código**: Compilação e testes completos
❌ **Faltando**: 3 tarefas administrativas na Play Store

---

## TAREFAS PENDENTES (CRÍTICAS)

Você PRECISA completar estas 3 tarefas antes de submeter o app para revisão na Play Store:

---

## 1️⃣ PUBLICAR POLÍTICA DE PRIVACIDADE

### O que você precisa fazer:
1. Faça upload do arquivo `PRIVACY_POLICY.md` para um servidor público
2. Recomendações:
   - **GitHub Pages** (fácil): Seu repositório já tem GitHub Pages configurado
      - **Vercel** (recomendado): Deploy gratuito, muito rápido
         - **Netlify**: Deploy gratuito

         ### Passo a passo com GitHub Pages:

         #### Opção A: Usar GitHub Pages (MAIS FÁCIL)

         1. Vá para: https://github.com/Hadrianrafael/Steteoi/settings/pages
         2. Confirme que "GitHub Pages" está habilitado na branch "main"
         3. Copie a URL pública gerada (deve ser: https://hadrianrafael.github.io/Steteoi/)
         4. Seu arquivo de política estará em:
            `https://hadrianrafael.github.io/Steteoi/artifacts/empire-clash/PRIVACY_POLICY.md`
            5. Teste se consegue acessar a URL no navegador

            #### Opção B: Usar Vercel (MAIS RÁPIDO)

            1. Vá para: https://vercel.com
            2. Faça login com sua conta GitHub
            3. Clique em "New Project"
            4. Selecione seu repositório "Steteoi"
            5. Deploy automático
            6. A URL será algo como: `https://steteoi.vercel.app/`
            7. Sua política estará em: `https://steteoi.vercel.app/artifacts/empire-clash/PRIVACY_POLICY.md`

            ### Onde usar a URL:
            - Guarde bem a URL da política de privacidade
            - Você usará isso no Play Console no Passo 3

            ---

            ## 2️⃣ PREENCHER QUESTIONÁRIO DE CLASSIFICAÇÃO ETÁRIA

            ### Como acessar:

            1. Vá para: https://play.google.com/console
            2. Entre com sua conta Google
            3. Selecione o app "Empire Clash" (ou crie uma nova entrada de app)
            4. No menu lateral esquerdo, procure por:
               - "Políticas de aplicativos" ou "App policies"
                  - "Conteúdo para menores" ou "Content rating"

                  ### O que preencher (para um jogo de estratégia):

                  Responda o questionário com base no seu jogo:

                  **Categoria de conteúdo:**
                  - Violence: **SIM** (batalhas, confrontos estratégicos com aviões)
                  - Sexual content: **NÃO**
                  - Profanity: **NÃO**
                  - Alcohol/tobacco: **NÃO**
                  - Scary content: **NÃO**
                  - User interactions: **SIM** (se houver chat - se sim, desabilite!)
                  - Ads: **SIM** (anúncios recompensados)

                  **Recomendações:**
                  - Idade mínima recomendada: 7-10 anos (jogo de estratégia, sem conteúdo sensível)
                  - Ou deixe o sistema determinar automaticamente

                  ### Após preencher:
                  - Salve o questionário
                  - Você receberá uma classificação automática
                  - Esta classificação será mostrada na Play Store

                  ---

                  ## 3️⃣ PREENCHER SEÇÃO DE DADOS DE ANÚNCIOS

                  ### Como acessar:

                  1. Vá para: https://play.google.com/console
                  2. Selecione o app "Empire Clash"
                  3. No menu lateral, procure por:
                     - "Políticas de aplicativos"
                        - "Ads" ou "Anúncios"
                           - "Formulário de dados de anúncios"

                           ### O que preencher:

                           **Seção 1: Dados do anúncio**
                           - ✅ Sim, este aplicativo exibe anúncios
                           - ✅ O app contém anúncios de produtos ou serviços

                           **Seção 2: Tipos de anúncios**

                           Marque os tipos de anúncios que seu app usa:
                           - ✅ **Banner ads** (se usa)
                           - ✅ **Interstitial ads** (anúncios entre telas) - SIM
                           - ✅ **Rewarded ads** (anúncios recompensados) - SIM
                           - ❌ Native ads (não)
                           - ❌ Outros tipos (não)

                           **Seção 3: Rede de anúncios**

                           Marque as plataformas de anúncios:
                           - ✅ **Google AdMob** (você usa isso)
                           - ❌ Facebook
                           - ❌ Outros

                           **Seção 4: Dados sensíveis**

                           Segundo seu `PLAYSTORE_CHECKLIST.md`:
                           - ✅ O app solicita permissão de ID de anúncio do Google
                           - ❌ Nenhum dado de saúde/financeiro coletado
                           - ❌ Nenhum dado biométrico

                           ### Após preencher:
                           - Salve o formulário
                           - Aguarde validação do Google (geralmente imediato)

                           ---

                           ## 4️⃣ VERIFICAR NO CONSOLE DO ADMOB (OPCIONAL MAS IMPORTANTE)

                           ### Passo a passo:

                           1. Vá para: https://admob.google.com
                           2. Entre com a mesma conta Google que usou para criar o projeto
                           3. No painel, procure por "Aplicativos"
                           4. Verifique se você vê:
                              - **App ID**: ca-app-pub-1752902298077786~3887343530 ✅
                                 - Status: **ATIVO**
                                 5. Clique no app para ver detalhes:
                                    - Ad units para anúncios recompensados: ca-app-pub-1752902298077786/8272251612
                                       - Ad units para intersticiais: ca-app-pub-1752902298077786/8252070315
                                       6. Se tudo estiver verde, significa que está pronto!

                                       **Nota**: Não teste com anúncios reais antes de publicar. Use apenas em produção após aprovação.

                                       ---

                                       ## 5️⃣ EXECUTAR O BUILD FINAL

                                       Apenas DEPOIS de completar os passos 1-4, execute:

                                       ```bash
                                       cd artifacts/empire-clash
                                       npm install -g eas-cli
                                       eas login
                                       eas credentials
                                       eas build -p android --profile production
                                       ```

                                       Este comando:
                                       - Compila o APK/AAB final para publicação
                                       - Assina com suas chaves de segurança
                                       - Pronto para upload na Play Store

                                       ---

                                       ## 6️⃣ ENVIAR PARA REVISÃO NA PLAY STORE

                                       ### Processo final:

                                       1. Vá para https://play.google.com/console
                                       2. Selecione o app Empire Clash
                                       3. Na seção "Releases", clique em "Create new release"
                                       4. Upload do arquivo .aab (gerado pelo EAS)
                                       5. Preencha:
                                          - Notas de lançamento: "Empire Clash v1.0 - Jogo estratégico com aviões"
                                             - Descrição de recursos principais
                                             6. Clique em "Review release"
                                             7. Confirme todos os detalhes
                                             8. Clique em "Start rollout to production"

                                             **Prazo de revisão**: 24-48 horas

                                             ---

                                             ## ✅ CHECKLIST FINAL

                                             Antes de submeter, confirme:

                                             - [ ] Política de Privacidade publicada em URL pública
                                             - [ ] URL da política guardada para usar no Play Console
                                             - [ ] Questionário de classificação etária preenchido
                                             - [ ] Seção de dados de anúncios preenchida
                                             - [ ] App ID do AdMob verificado como ATIVO
                                             - [ ] Build production executado com sucesso
                                             - [ ] Arquivo .aab gerado e pronto
                                             - [ ] Informações do app preenchidas no Play Console (descrição, screenshots, etc)
                                             - [ ] Todas as políticas de privacidade/consentimento ok

                                             ---

                                             ## 📞 SUPORTE

                                             Em caso de dúvidas:

                                             - **Play Console Help**: https://support.google.com/googleplay/android-developer
                                             - **AdMob Documentation**: https://support.google.com/admob
                                             - **Expo EAS Build**: https://docs.expo.dev/build/introduction/

                                             ---

                                             **Status do Projeto**: Pronto para lançamento!
                                             **Tempo estimado para completar**: 30-45 minutos
                                             **Data de criação**: 7 de maio de 2026
