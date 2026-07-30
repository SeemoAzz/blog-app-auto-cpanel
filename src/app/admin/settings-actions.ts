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
} from "@/lib/settings";

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
