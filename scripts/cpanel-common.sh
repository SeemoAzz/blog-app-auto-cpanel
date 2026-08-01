#!/bin/bash
# Helpers partages par cpanel-install.sh et cpanel-deploy.sh

cpanel_setup_path() {
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  cd "$ROOT"

  # cPanel : ~/nodevenv/<chemin relatif depuis $HOME>/20/bin
  # ex. ~/blog2/blog-app-auto-cpanel -> ~/nodevenv/blog2/blog-app-auto-cpanel/20/bin
  REL_PATH="${ROOT#$HOME/}"
  NODE_BIN="$HOME/nodevenv/$REL_PATH/20/bin"
  if [ ! -d "$NODE_BIN" ]; then
    APP_NAME="$(basename "$ROOT")"
    NODE_BIN="$HOME/nodevenv/$APP_NAME/20/bin"
  fi
  if [ -d "$NODE_BIN" ]; then
    export PATH="$NODE_BIN:$PATH"
  fi
}

cpanel_ensure_local_node_modules() {
  if [ -L "node_modules" ]; then
    echo "==> Suppression du symlink node_modules (nodevenv)..."
    rm node_modules
    return
  fi

  if [ -d "node_modules" ] && [ ! -x "node_modules/.bin/prisma" ]; then
    echo "==> node_modules incomplet (prisma absent) — reinstallation..."
    rm -rf node_modules
  fi
}

cpanel_npm_install() {
  echo "==> Installation npm (node_modules local)..."
  NODE_ENV=development npm install --include=dev

  if [ ! -x "node_modules/.bin/prisma" ]; then
    echo "==> Prisma CLI toujours absent — nouvelle tentative..."
    rm -rf node_modules
    NODE_ENV=development npm install --include=dev --no-cache
  fi

  if [ ! -x "node_modules/.bin/prisma" ]; then
    echo "ERREUR: prisma introuvable apres npm install."
    echo "       Verifiez: ls node_modules/prisma && npm ls prisma"
    exit 1
  fi
}

cpanel_prisma() {
  local schema="$1"
  shift
  "$ROOT/node_modules/.bin/prisma" "$@" --schema="$schema"
}
