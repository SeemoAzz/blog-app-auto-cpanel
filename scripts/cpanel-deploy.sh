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

SCHEMA="$ROOT/prisma/schema.prisma"

export NODE_ENV=production

echo "==> Installation des dependances..."
NODE_ENV=development npm install --include=dev --prefix "$ROOT"

echo "==> Generation du client Prisma..."
npx prisma generate --schema="$SCHEMA"

echo "==> Application des migrations..."
npx prisma migrate deploy --schema="$SCHEMA"

echo "==> Build Next.js..."
cd "$ROOT"
NODE_ENV=production npm run build

mkdir -p public/uploads

echo "==> Deploiement termine. Redemarrez l'application Node.js dans cPanel."
