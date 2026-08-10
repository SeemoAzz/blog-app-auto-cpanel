#!/bin/bash
# Mise a jour cPanel apres git pull.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=cpanel-common.sh
source "$SCRIPT_DIR/cpanel-common.sh"
cpanel_setup_path
cpanel_load_config

cpanel_ensure_blogdata
cpanel_ensure_local_node_modules

SCHEMA="$ROOT/prisma/schema.prisma"

cpanel_npm_install

echo "==> Generation du client Prisma..."
cpanel_prisma "$SCHEMA" generate

echo "==> Application des migrations..."
cpanel_prisma "$SCHEMA" migrate deploy

echo "==> Build Next.js (webpack, 1 worker)..."
cpanel_run_build

mkdir -p public/uploads data/uploads

echo "==> Deploiement termine. Redemarrez l'application Node.js dans cPanel."
