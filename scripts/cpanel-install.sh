#!/bin/bash
# Installation initiale cPanel — a lancer via Terminal cPanel.
#   bash scripts/cpanel-install.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP_NAME="$(basename "$ROOT")"
NODE_BIN="$HOME/nodevenv/$APP_NAME/20/bin"
if [ -d "$NODE_BIN" ]; then
  export PATH="$NODE_BIN:$PATH"
fi

echo "==> Dossier application: $ROOT"
echo "==> Node: $(node -v) — npm: $(npm -v)"

if [ ! -f "prisma/schema.prisma" ]; then
  echo "ERREUR: prisma/schema.prisma introuvable."
  exit 1
fi

mkdir -p ~/blogdata && chmod 750 ~/blogdata
mkdir -p public/uploads && chmod 755 public/uploads

# cPanel lie node_modules -> nodevenv : Turbopack/webpack echoue au build
if [ -L "node_modules" ]; then
  echo "==> Suppression du symlink node_modules (nodevenv)..."
  rm node_modules
fi

SCHEMA="$ROOT/prisma/schema.prisma"

echo "==> Installation npm (node_modules local)..."
NODE_ENV=development npm install --include=dev

PRISMA="$ROOT/node_modules/.bin/prisma"
TSX="$ROOT/node_modules/tsx/dist/cli.mjs"

echo "==> Generation Prisma..."
"$PRISMA" generate --schema="$SCHEMA"

echo "==> Migrations..."
"$PRISMA" migrate deploy --schema="$SCHEMA"

echo "==> Seed admin..."
node "$TSX" prisma/seed.ts || echo "(seed deja fait)"

echo "==> Build Next.js (webpack — compatible cPanel)..."
NODE_ENV=production npm run build

echo ""
echo "==> OK ! cPanel > Setup Node.js App > RESTART"
echo "    https://blog.arasnews.com/admin"
