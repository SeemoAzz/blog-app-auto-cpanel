#!/bin/bash
# Installation initiale cPanel — a lancer via Terminal cPanel.
#   bash scripts/cpanel-install.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=cpanel-common.sh
source "$SCRIPT_DIR/cpanel-common.sh"
cpanel_setup_path
cpanel_load_config

echo "==> Dossier application: $ROOT"
echo "==> Site: $CPANEL_SITE_URL"
echo "==> Base SQLite: $CPANEL_DATABASE_URL"
echo "==> Node: $(node -v) — npm: $(npm -v)"

if [ ! -f "prisma/schema.prisma" ]; then
  echo "ERREUR: prisma/schema.prisma introuvable."
  exit 1
fi

cpanel_ensure_blogdata
mkdir -p public/uploads && chmod 755 public/uploads

# cPanel lie node_modules -> nodevenv : Turbopack/webpack echoue au build
cpanel_ensure_local_node_modules

SCHEMA="$ROOT/prisma/schema.prisma"

cpanel_npm_install

TSX="$ROOT/node_modules/tsx/dist/cli.mjs"

echo "==> Generation Prisma..."
cpanel_prisma "$SCHEMA" generate

echo "==> Migrations..."
cpanel_prisma "$SCHEMA" migrate deploy

echo "==> Seed admin..."
node "$TSX" prisma/seed.ts || echo "(seed deja fait)"

echo "==> Build Next.js (webpack, 1 worker — limite cPanel)..."
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=512" npm run build

echo ""
echo "==> OK ! cPanel > Setup Node.js App > RESTART"
echo "    ${CPANEL_SITE_URL}/admin"
echo ""
echo "    Verifiez dans cPanel que DATABASE_URL = $CPANEL_DATABASE_URL"
echo "    et NEXT_PUBLIC_SITE_URL = $CPANEL_SITE_URL"
