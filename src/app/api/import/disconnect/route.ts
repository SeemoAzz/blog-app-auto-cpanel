import { NextResponse } from "next/server";
import { clearBotConnection, verifyImportToken } from "@/lib/import-auth";

export async function POST(req: Request) {
  if (!(await verifyImportToken(req))) {
    return NextResponse.json({ error: "Token invalide ou absent" }, { status: 401 });
  }

  await clearBotConnection();

  return NextResponse.json({ ok: true, connected: false });
}
