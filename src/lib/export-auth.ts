import "server-only";
import crypto from "crypto";
import { getSetting, setSetting } from "@/lib/settings";

export function generateExportApiKey(): string {
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

/** Verifie la cle API Bearer contre celle configuree pour l'export. */
export async function verifyExportApiKey(req: Request): Promise<boolean> {
  const provided = extractBearerToken(req);
  if (!provided) return false;

  const exportSettings = await getSetting("export");
  const stored = exportSettings.apiKey?.trim();
  if (!stored) return false;

  return safeEqual(provided, stored);
}

/** Enregistre un acces reussi a l'API d'export. */
export async function recordExportAccess(): Promise<void> {
  const exportSettings = await getSetting("export");
  await setSetting("export", {
    ...exportSettings,
    lastAccessAt: new Date().toISOString(),
  });
}
