import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { regenerateImageAsset } from "@/lib/ai/generator";

export const maxDuration = 180;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  if (!(await isAiConfigured())) {
    return NextResponse.json({ error: "IA non configuree." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "Prompt requis" }, { status: 400 });
  }

  try {
    const result = await regenerateImageAsset({
      prompt: body.prompt,
      aspectRatio: body.aspectRatio,
      alt: body.alt,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 },
    );
  }
}
