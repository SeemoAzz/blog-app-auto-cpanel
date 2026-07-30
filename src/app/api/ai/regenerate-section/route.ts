import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { regenerateSection } from "@/lib/ai/generator";

export const maxDuration = 120;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  if (!(await isAiConfigured())) {
    return NextResponse.json({ error: "IA non configuree." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.heading || !body.topic) {
    return NextResponse.json({ error: "Sujet et titre de section requis" }, { status: 400 });
  }

  try {
    const result = await regenerateSection({
      topic: body.topic,
      language: body.language,
      tone: body.tone,
      heading: body.heading,
      instruction: body.instruction,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 },
    );
  }
}
