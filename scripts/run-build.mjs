#!/usr/bin/env node
/**
 * Build Next.js compatible hebergement mutualise (cPanel / CloudLinux).
 * - Limite les threads (UV, tokio, rayon)
 * - Mode "compile" par defaut : evite "Generating static pages" qui provoque
 *   OS can't spawn worker thread (os error 11) sur LVE cPanel.
 * Toutes les routes de ce blog sont dynamiques (force-dynamic) : compile suffit.
 *
 * Usage:
 *   node scripts/run-build.mjs         # compile (recommande cPanel)
 *   node scripts/run-build.mjs --full  # build complet (local / CI)
 */

import { spawnSync } from "node:child_process";

const full = process.argv.includes("--full");

const env = {
  ...process.env,
  NODE_ENV: "production",
  UV_THREADPOOL_SIZE: "1",
  TOKIO_WORKER_THREADS: "1",
  RAYON_NUM_THREADS: "1",
  NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=512",
};

const args = ["next", "build", "--webpack"];
if (!full) {
  args.push("--experimental-build-mode", "compile");
}

console.log(
  full
    ? "==> Build Next.js complet (generate static pages)..."
    : "==> Build Next.js mode compile (cPanel / mutualise)...",
);

const result = spawnSync("npx", args, {
  env,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
