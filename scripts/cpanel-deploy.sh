#!/bin/bash
# Script de deploiement pour cPanel (Namecheap).
# Appele automatiquement par .cpanel.yml ou manuellement via: npm run cpanel:deploy

set -euo pipefail

ROOT="${DEPLOYPATH:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

echo "==> Deploiement dans: $ROOT"

export NODE_ENV=production

echo "==> Installation des dependances..."
# Next.js a besoin des devDependencies (typescript, tailwind...) pour le build
npm install

echo "==> Generation du client Prisma..."
npx prisma generate

echo "==> Application des migrations..."
npx prisma migrate deploy

echo "==> Build Next.js..."
npm run build

echo "==> Creation du dossier uploads..."
mkdir -p public/uploads

echo "==> Deploiement termine. Redemarrez l'application Node.js dans cPanel."
