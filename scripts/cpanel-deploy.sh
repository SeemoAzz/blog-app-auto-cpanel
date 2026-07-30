#!/bin/bash
# Mise a jour cPanel apres git pull.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP_NAME="$(basename "$ROOT")"
NODE_BIN="$HOME/nodevenv/$APP_NAME/20/bin"
if [ -d "$NODE_BIN" ]; then
  export PATH="$NODE_BIN:$PATH"
fi

if [ -L "node_modules" ]; then
  echo "==> Suppression du symlink node_modules..."
  rm node_modules
fi

SCHEMA="$ROOT/prisma/schema.prisma"
PRISMA="$ROOT/node_modules/.bin/prisma"

echo "==> Installation des dependances..."
NODE_ENV=development npm install --include=dev

echo "==> Generation du client Prisma..."
"$PRISMA" generate --schema="$SCHEMA"

echo "==> Application des migrations..."
"$PRISMA" migrate deploy --schema="$SCHEMA"

echo "==> Build Next.js (webpack)..."
NODE_ENV=production npm run build

mkdir -p public/uploads

echo "==> Deploiement termine. Redemarrez l'application Node.js dans cPanel."
