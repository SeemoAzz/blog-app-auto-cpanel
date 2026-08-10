import "server-only";
import crypto from "crypto";
import { getSetting, setSetting } from "@/lib/settings";

export function generateImportToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Verifie le token Bearer contre le token d'import configure. */
export async function verifyImportToken(req: Request): Promise<boolean> {
  const provided = extractBearerToken(req);
  if (!provided) return false;

  const importSettings = await getSetting("import");
  const stored = importSettings.token?.trim();
  if (!stored) return false;

  return safeEqual(provided, stored);
}

/** Enregistre un contact reussi depuis News Bot (verify ou import). */
export async function recordBotConnection(): Promise<void> {
  const importSettings = await getSetting("import");
  await setSetting("import", {
    ...importSettings,
    lastBotSeenAt: new Date().toISOString(),
    botConnectionActive: true,
  });
}

/** News Bot signale qu'il supprime la connexion vers ce blog. */
export async function clearBotConnection(): Promise<void> {
  const importSettings = await getSetting("import");
  await setSetting("import", {
    ...importSettings,
    botConnectionActive: false,
  });
}
