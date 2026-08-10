#!/bin/bash
# Helpers partages par cpanel-install.sh et cpanel-deploy.sh

cpanel_load_config() {
  local config_file="$ROOT/cpanel.config"

  CPANEL_SITE_URL="${CPANEL_SITE_URL:-}"
  CPANEL_BLOGDATA_DIR="${CPANEL_BLOGDATA_DIR:-blogdata}"
  CPANEL_DB_FILENAME="${CPANEL_DB_FILENAME:-prod.db}"

  if [ -f "$config_file" ]; then
    # shellcheck source=/dev/null
    source "$config_file"
  fi

  if [ -z "${CPANEL_SITE_URL:-}" ]; then
    echo "ERREUR: CPANEL_SITE_URL manquant."
    echo "       Copiez cpanel.config.example vers cpanel.config et renseignez l'URL du site."
    exit 1
  fi

  if [[ "$CPANEL_BLOGDATA_DIR" == /* ]]; then
    CPANEL_BLOGDATA_PATH="$CPANEL_BLOGDATA_DIR"
  else
    CPANEL_BLOGDATA_PATH="$HOME/$CPANEL_BLOGDATA_DIR"
  fi

  CPANEL_DATABASE_URL="file:${CPANEL_BLOGDATA_PATH}/${CPANEL_DB_FILENAME}"

  if [ -n "${DATABASE_URL:-}" ] && [ "$DATABASE_URL" != "$CPANEL_DATABASE_URL" ]; then
    echo "==> ATTENTION: DATABASE_URL cPanel ($DATABASE_URL)"
    echo "              differe de cpanel.config ($CPANEL_DATABASE_URL)"
    echo "              Utilisation de cpanel.config pour ce script."
  fi

  export DATABASE_URL="$CPANEL_DATABASE_URL"
}

cpanel_ensure_blogdata() {
  mkdir -p "$CPANEL_BLOGDATA_PATH"
  chmod 750 "$CPANEL_BLOGDATA_PATH"
}

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

cpanel_prepare_lve() {
  export UV_THREADPOOL_SIZE=1
  export TOKIO_WORKER_THREADS=1
  export RAYON_NUM_THREADS=1
  export npm_config_maxsockets=1
  export npm_config_fetch_retries=10
  export npm_config_fetch_retry_mintimeout=30000
}

# Compte les processus sans fork (lecture /proc en bash pur).
# ps/whoami/ulimit provoquent eux-memes fork: Resource temporarily unavailable.
cpanel_count_user_procs() {
  local count=0 uid="$UID" pid line uid_field
  for pid in /proc/[0-9]*; do
    [ -r "$pid/status" ] || continue
    uid_field=""
    while IFS= read -r line; do
      case "$line" in
        Uid:*)
          uid_field="${line#Uid:}"
          uid_field="${uid_field#"${uid_field%%[![:space:]]*}"}"
          if [ "${uid_field%% *}" = "$uid" ]; then
            count=$((count + 1))
          fi
          break
          ;;
      esac
    done < "$pid/status"
  done
  echo "$count"
}

cpanel_warn_lve() {
  local proc_count
  echo "==> CloudLinux LVE (limite de processus)"
  echo "    AVANT npm : cPanel > Setup Node.js App > STOP sur TOUTES vos apps Node.js"
  echo "    Sinon : fork: Resource temporarily unavailable"
  proc_count="$(cpanel_count_user_procs)"
  echo "    Processus actifs (UID $UID): $proc_count"
  if [ "$proc_count" -gt 15 ]; then
    echo ""
    echo "ERREUR: trop de processus ($proc_count) — STOP toutes les apps Node.js dans cPanel,"
    echo "       attendez 1 min, puis relancez : npm run cpanel:deploy"
    exit 1
  fi
}

cpanel_npm_install() {
  cpanel_prepare_lve
  cpanel_warn_lve

  echo "==> Installation npm (node_modules local)..."
  echo "    Sur hebergement mutualise : 5 a 30 min sans autre ligne est normal."
  echo "    Verifiez l'activite : ps aux | grep npm   (autre session SSH)"

  local npm_flags=(
    --include=dev
    --no-audit
    --no-fund
    --loglevel=info
    --maxsockets=1
  )
  local start_ts elapsed attempt

  _cpanel_run_npm() {
    if [ -f package-lock.json ]; then
      echo "    Mode: npm ci (package-lock.json)"
      NODE_ENV=development npm ci "${npm_flags[@]}" "$@"
    else
      echo "    Mode: npm install"
      NODE_ENV=development npm install "${npm_flags[@]}" "$@"
    fi
  }

  start_ts=$(date +%s)
  attempt=1
  while [ "$attempt" -le 3 ]; do
    if _cpanel_run_npm; then
      break
    fi
    if [ "$attempt" -ge 3 ]; then
      echo ""
      echo "ERREUR: npm a echoue apres 3 tentatives."
      echo "       1. STOP toutes les apps Node.js dans cPanel"
      echo "       2. Attendre 1 min, puis : ps -u \$(whoami) | wc -l"
      echo "       3. Relancer : npm run cpanel:deploy"
      echo "       Si fork persiste : builder en local et copier node_modules + .next"
      exit 1
    fi
    echo "==> npm echoue (tentative $attempt/3) — STOP les apps Node.js, attente 45s..."
    sleep 45
    attempt=$((attempt + 1))
  done
  elapsed=$(( $(date +%s) - start_ts ))
  echo "==> npm termine en ${elapsed}s"

  if [ ! -x "node_modules/.bin/prisma" ]; then
    echo "==> Prisma CLI absent — nouvelle tentative..."
    rm -rf node_modules
    start_ts=$(date +%s)
    _cpanel_run_npm --no-cache || {
      echo "ERREUR: npm ci impossible (limite LVE). Arretez les apps Node.js et reessayez."
      exit 1
    }
    elapsed=$(( $(date +%s) - start_ts ))
    echo "==> npm (retry) termine en ${elapsed}s"
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

# Build Next.js avec limites de threads/proc pour hebergement mutualise (CloudLinux).
cpanel_run_build() {
  export NODE_ENV=production
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"
  export UV_THREADPOOL_SIZE=1
  export TOKIO_WORKER_THREADS=1
  export RAYON_NUM_THREADS=1
  node "$ROOT/scripts/run-build.mjs"
}
