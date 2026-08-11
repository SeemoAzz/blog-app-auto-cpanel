import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordExportAccess, verifyExportApiKey } from "@/lib/export-auth";
import {
  resolveArticleHeroImage,
  toAbsoluteUrl,
} from "@/lib/export-articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await verifyExportApiKey(req))) {
    return NextResponse.json({ error: "Cle API invalide ou absente" }, { status: 401 });
  }

  await recordExportAccess();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "published";
  const where =
    status === "all" ? {} : { status: status === "draft" ? "draft" : "published" };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      title: true,
      slug: true,
      ogImage: true,
      puckData: true,
      publishedAt: true,
      cover: true,
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  const items = articles.map((article) => {
    const heroPath = resolveArticleHeroImage(article);
    return {
      title: article.title,
      slug: article.slug,
      url: toAbsoluteUrl(`/article/${article.slug}`, baseUrl),
      heroImage: heroPath ? toAbsoluteUrl(heroPath, baseUrl) : null,
      publishedAt: article.publishedAt?.toISOString() ?? null,
    };
  });

  return NextResponse.json({
    ok: true,
    articles: items,
    total: items.length,
  });
}
