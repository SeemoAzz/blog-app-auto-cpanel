"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  getSetting,
  setSetting,
  type SiteSettings,
  type ThemeSettings,
  type NavLink,
  type AdsenseSettings,
  type AnalyticsSettings,
  type AiSettings,
  type ImportSettings,
} from "@/lib/settings";
import { generateImportToken } from "@/lib/import-auth";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Non autorise");
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function saveAppearance(input: {
  site: SiteSettings;
  theme: ThemeSettings;
  nav: NavLink[];
}) {
  await requireAuth();
  await Promise.all([
    setSetting("site", input.site),
    setSetting("theme", input.theme),
    setSetting("nav", input.nav.filter((l) => l.label && l.href)),
  ]);
  revalidateSite();
  return { ok: true as const };
}

export async function saveAdsense(input: AdsenseSettings) {
  await requireAuth();
  await setSetting("adsense", input);
  revalidateSite();
  return { ok: true as const };
}

export async function saveAnalytics(input: AnalyticsSettings) {
  await requireAuth();
  await setSetting("analytics", input);
  revalidateSite();
  return { ok: true as const };
}

export async function saveAi(input: AiSettings) {
  await requireAuth();
  const current = await getSetting("ai");
  const apiKey = input.apiKey?.trim()
    ? input.apiKey.trim()
    : current.apiKey ?? "";
  await setSetting("ai", {
    textModel: input.textModel,
    imageModel: input.imageModel,
    apiKey,
  });
  return { ok: true as const };
}

export async function saveImport(input: ImportSettings) {
  await requireAuth();
  await setSetting("import", input);
  return { ok: true as const };
}

/** Genere un token uniquement s'il n'existe pas encore. */
export async function ensureImportToken() {
  await requireAuth();
  const current = await getSetting("import");
  const existing = current.token?.trim();
  if (existing) {
    return { ok: true as const, token: existing, created: false as const };
  }
  const token = generateImportToken();
  await setSetting("import", {
    ...current,
    token,
    botConnectionActive: false,
    lastBotSeenAt: undefined,
  });
  revalidatePath("/admin/import-api");
  return { ok: true as const, token, created: true as const };
}

/** Remplace le token actuel par un nouveau (deconnecte les apps liees). */
export async function regenerateImportToken() {
  await requireAuth();
  const current = await getSetting("import");
  const token = generateImportToken();
  await setSetting("import", {
    ...current,
    token,
    botConnectionActive: false,
    lastBotSeenAt: undefined,
  });
  revalidatePath("/admin/import-api");
  return { ok: true as const, token };
}

/** Supprime le token d'import (deconnecte toutes les apps). */
export async function deleteImportToken() {
  await requireAuth();
  const current = await getSetting("import");
  await setSetting("import", {
    ...current,
    token: undefined,
    botConnectionActive: false,
    lastBotSeenAt: undefined,
  });
  revalidatePath("/admin/import-api");
  return { ok: true as const };
}

/** Enregistre le token d'import (sans le regenerer). */
export async function saveImportToken(token: string) {
  await requireAuth();
  const trimmed = token.trim();
  if (!trimmed) throw new Error("Token requis");
  const current = await getSetting("import");
  const tokenChanged = current.token?.trim() !== trimmed;
  await setSetting("import", {
    ...current,
    token: trimmed,
    ...(tokenChanged ? { botConnectionActive: false } : {}),
  });
  revalidatePath("/admin/import-api");
  return { ok: true as const };
}

/** Remet le statut a « deconnecte » (apres suppression cote News Bot). */
export async function resetBotConnectionStatus() {
  await requireAuth();
  const { clearBotConnection } = await import("@/lib/import-auth");
  await clearBotConnection();
  revalidatePath("/admin/import-api");
  return { ok: true as const };
}
