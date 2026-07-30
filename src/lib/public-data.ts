import { prisma } from "./prisma";
import type { ArticleCardData } from "@/puck/config";

/** Recupere les cartes d'articles publies pour alimenter les blocs ArticleList. */
export async function getArticleCards(limit = 24): Promise<ArticleCardData[]> {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { cover: true, category: true },
  });

  return articles.map((a) => ({
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    cover: a.cover?.url ?? a.ogImage ?? null,
    categoryName: a.category?.name ?? null,
    categorySlug: a.category?.slug ?? null,
  }));
}
