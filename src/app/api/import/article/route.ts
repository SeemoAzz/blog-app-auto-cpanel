import { NextResponse } from "next/server";
import { recordBotConnection, verifyImportToken } from "@/lib/import-auth";
import { importArticleAsDraft } from "@/lib/import-article";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  if (!(await verifyImportToken(req))) {
    return NextResponse.json({ error: "Token invalide ou absent" }, { status: 401 });
  }

  await recordBotConnection();

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Champ title requis" }, { status: 400 });
  }

  const hasContent =
    (typeof body.content === "string" && body.content.trim()) ||
    (Array.isArray(body.contentBlocks) && body.contentBlocks.length > 0);

  if (!hasContent) {
    return NextResponse.json(
      { error: "Contenu requis (content ou contentBlocks)" },
      { status: 400 },
    );
  }

  try {
    const result = await importArticleAsDraft({
      title: body.title.trim(),
      content: typeof body.content === "string" ? body.content : undefined,
      contentBlocks: Array.isArray(body.contentBlocks) ? body.contentBlocks : undefined,
      sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl : undefined,
      author: typeof body.author === "string" ? body.author : undefined,
      siteName: typeof body.siteName === "string" ? body.siteName : undefined,
      language: typeof body.language === "string" ? body.language : undefined,
      tone: typeof body.tone === "string" ? body.tone : undefined,
      withHeroImage: body.withHeroImage === true,
      sectionImages: body.sectionImages === true,
      categorySlug: typeof body.categorySlug === "string" ? body.categorySlug : undefined,
      externalId: typeof body.externalId === "string" ? body.externalId : undefined,
      publish: body.publish === true,
    });

    return NextResponse.json({ ok: true, article: result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur d'import" },
      { status: 500 },
    );
  }
}
