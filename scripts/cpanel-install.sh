#!/bin/bash
# Installation initiale cPanel — a lancer UNE FOIS via Terminal cPanel.
# Copiez-collez la commande d'activation affichee dans Setup Node.js App, puis :
#   bash scripts/cpanel-install.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Dossier: $ROOT"
echo "==> Contenu prisma:"
ls -la prisma/ 2>/dev/null || echo "    (dossier prisma ABSENT)"

# Restaurer prisma/ si absent du disque mais present dans git
if [ ! -f "prisma/schema.prisma" ]; then
  echo "==> prisma/schema.prisma manquant — restauration depuis git..."
  git fetch origin master 2>/dev/null || true
  git checkout HEAD -- prisma/ 2>/dev/null || git checkout origin/master -- prisma/ 2>/dev/null || true
fi

if [ ! -f "prisma/schema.prisma" ]; then
  echo ""
  echo "ERREUR: prisma/schema.prisma toujours introuvable."
  echo "Verifiez que le depot GitHub contient le dossier prisma/."
  echo "  git remote -v"
  echo "  git ls-tree HEAD prisma/"
  echo "  pwd && ls -la"
  exit 1
fi

# Dossier SQLite (hors public_html)
mkdir -p ~/blogdata
chmod 750 ~/blogdata

# Dossier uploads
mkdir -p public/uploads
chmod 755 public/uploads

echo "==> Installation npm (devDependencies requises pour le build)..."
# NODE_ENV=production (injecte par cPanel) skip les devDependencies — on force leur installation
NODE_ENV=development npm install --include=dev

echo "==> Generation Prisma..."
npx prisma generate --schema="$ROOT/prisma/schema.prisma"

echo "==> Migrations base de donnees..."
npx prisma migrate deploy

echo "==> Seed admin (premiere fois uniquement)..."
npx prisma db seed || echo "(seed deja fait ou erreur non bloquante)"

echo "==> Build Next.js..."
NODE_ENV=production npm run build

echo ""
echo "==> OK ! Retournez dans cPanel > Setup Node.js App > cliquez RESTART"
echo "    Puis ouvrez https://blog.arasnews.com/admin"
