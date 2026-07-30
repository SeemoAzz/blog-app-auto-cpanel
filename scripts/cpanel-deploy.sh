#!/bin/bash
# Script de deploiement pour cPanel (Namecheap).
# Appele automatiquement par .cpanel.yml ou manuellement via: npm run cpanel:deploy

set -euo pipefail

ROOT="${DEPLOYPATH:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

echo "==> Deploiement dans: $ROOT"

export NODE_ENV=production

echo "==> Installation des dependances..."
# devDependencies (typescript, tailwind) necessaires pour next build
NODE_ENV=development npm install --include=dev

if [ ! -f "prisma/schema.prisma" ]; then
  echo "==> Restauration prisma/ depuis git..."
  git checkout HEAD -- prisma/ 2>/dev/null || true
fi

echo "==> Generation du client Prisma..."
npx prisma generate --schema="$ROOT/prisma/schema.prisma"

echo "==> Application des migrations..."
npx prisma migrate deploy

echo "==> Build Next.js..."
npm run build

echo "==> Creation du dossier uploads..."
mkdir -p public/uploads

echo "==> Deploiement termine. Redemarrez l'application Node.js dans cPanel."
