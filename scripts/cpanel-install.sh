#!/bin/bash
# Installation initiale cPanel — a lancer UNE FOIS via Terminal cPanel.
# Copiez-collez la commande d'activation affichee dans Setup Node.js App, puis :
#   bash scripts/cpanel-install.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Dossier: $ROOT"

# Dossier SQLite (hors public_html)
mkdir -p ~/blogdata
chmod 750 ~/blogdata

# Dossier uploads
mkdir -p public/uploads
chmod 755 public/uploads

export NODE_ENV=production

echo "==> Installation npm (avec devDependencies pour le build)..."
npm install

echo "==> Generation Prisma..."
npx prisma generate

echo "==> Migrations base de donnees..."
npx prisma migrate deploy

echo "==> Seed admin (premiere fois uniquement)..."
npx prisma db seed || echo "(seed deja fait ou erreur non bloquante)"

echo "==> Build Next.js..."
npm run build

echo ""
echo "==> OK ! Retournez dans cPanel > Setup Node.js App > cliquez RESTART"
echo "    Puis ouvrez https://blog.arasnews.com/admin"
