#!/bin/bash
# fix-git.sh — Resolve merge conflict no app.json e sincroniza o repositorio
# Como usar: no Shell do Replit, execute:
#   bash artifacts/empire-clash/fix-git.sh

set -e
cd /home/runner/workspace

echo "=== Empire Clash — Git Fix ==="

if [ -f ".git/index.lock" ]; then
  echo "-> Removendo .git/index.lock bloqueante..."
  rm -f .git/index.lock
fi

if grep -q "<<<<<<" artifacts/empire-clash/app.json 2>/dev/null; then
  echo "ERRO: app.json ainda tem marcadores de conflito. Abra o arquivo e remova manualmente as linhas <<<<<<, =======, >>>>>>>."
  exit 1
fi

node -e "JSON.parse(require('fs').readFileSync('artifacts/empire-clash/app.json','utf8')); console.log('  app.json: JSON valido')"

echo "-> Marcando app.json como resolvido..."
git add artifacts/empire-clash/app.json

echo "-> Commitando..."
git commit -m "release: final production build for Play Store"

echo "-> Push para origin/main..."
git push origin main

echo ""
echo "=== Pronto! Repositorio limpo. ==="
echo "Proximo passo: eas build -p android --profile production"
