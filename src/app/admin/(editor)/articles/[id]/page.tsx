import { notFound } from "next/navigation";
import type { Data } from "@puckeditor/core";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { getArticleCards } from "@/lib/public-data";
import { emptyData } from "@/puck/config";
import { ContentEditor } from "@/components/editor/ContentEditor";

export const dynamic = "force-dynamic";

function parseData(json: string): Data {
  try {
    const d = JSON.parse(json);
    if (d && Array.isArray(d.content)) return d as Data;
  } catch {}
  return emptyData();
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories, adsense, previewArticles] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { cover: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSetting("adsense"),
    getArticleCards(),
  ]);

  if (!article) notFound();

  return (
    <ContentEditor
      kind="article"
      initialData={parseData(article.puckData)}
      initialMeta={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        status: article.status as "draft" | "published",
        locale: article.locale,
        categoryId: article.categoryId,
        coverMediaId: article.coverMediaId,
        coverUrl: article.cover?.url || null,
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        ogImage: article.ogImage || "",
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      previewArticles={previewArticles}
      adsenseClientId={adsense.enabled ? adsense.clientId : ""}
    />
  );
}
