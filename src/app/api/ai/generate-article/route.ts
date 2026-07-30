import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { generateArticleDraft } from "@/lib/ai/generator";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  if (!(await isAiConfigured())) {
    return NextResponse.json(
      { error: "IA non configuree. Ajoute ta cle API dans Admin > Reglages." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  if (!body.topic || typeof body.topic !== "string") {
    return NextResponse.json({ error: "Sujet requis" }, { status: 400 });
  }

  try {
    const article = await generateArticleDraft({
      topic: body.topic,
      language: body.language,
      tone: body.tone,
      sectionsCount: body.sectionsCount,
      withHeroImage: body.withHeroImage,
      sectionImages: body.sectionImages,
    });
    return NextResponse.json({ article });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur de generation" },
      { status: 500 },
    );
  }
}
