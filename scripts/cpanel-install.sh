#!/bin/bash
# Installation initiale cPanel — a lancer via Terminal cPanel.
#   bash scripts/cpanel-install.sh
#
# NE PAS activer le venv avant : cPanel installe npm dans nodevenv/lib
# et les scripts postinstall echouent. Ce script gere Node.js lui-meme.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Node.js cPanel : utiliser le binaire du venv sans activer npm dedans
APP_NAME="$(basename "$ROOT")"
NODE_BIN="$HOME/nodevenv/$APP_NAME/20/bin"
if [ -d "$NODE_BIN" ]; then
  export PATH="$NODE_BIN:$PATH"
fi

echo "==> Dossier application: $ROOT"
echo "==> Node: $(node -v) — npm: $(npm -v)"
echo "==> Contenu prisma:"
ls -la prisma/

if [ ! -f "prisma/schema.prisma" ]; then
  echo "ERREUR: prisma/schema.prisma introuvable."
  echo "Lancez: git pull origin master && git checkout HEAD -- prisma/"
  exit 1
fi

mkdir -p ~/blogdata && chmod 750 ~/blogdata
mkdir -p public/uploads && chmod 755 public/uploads

SCHEMA="$ROOT/prisma/schema.prisma"

echo "==> Installation npm dans $ROOT ..."
# --prefix force npm a utiliser le dossier app, pas nodevenv/lib
NODE_ENV=development npm install --include=dev --prefix "$ROOT"

echo "==> Generation Prisma..."
npx prisma generate --schema="$SCHEMA"

echo "==> Migrations..."
npx prisma migrate deploy --schema="$SCHEMA"

echo "==> Seed admin (premiere fois)..."
npx prisma db seed --schema="$SCHEMA" || echo "(seed deja fait)"

echo "==> Build Next.js..."
cd "$ROOT"
NODE_ENV=production npm run build

echo ""
echo "==> OK ! cPanel > Setup Node.js App > RESTART"
echo "    https://blog.arasnews.com/admin"
