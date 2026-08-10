import { NextResponse } from "next/server";
import { recordBotConnection, verifyImportToken } from "@/lib/import-auth";
import { isAiConfigured, verifyOpenRouterConnection } from "@/lib/ai/openrouter";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await verifyImportToken(req))) {
    return NextResponse.json({ error: "Token invalide ou absent" }, { status: 401 });
  }

  await recordBotConnection();

  const [site, aiConfigured, aiVerified] = await Promise.all([
    getSetting("site"),
    isAiConfigured(),
    verifyOpenRouterConnection(),
  ]);

  return NextResponse.json({
    ok: true,
    siteTitle: site.title,
    aiConfigured,
    aiVerified,
  });
}
