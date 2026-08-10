import { prisma } from "./prisma";
import type { ArticleCardData } from "@/puck/config";
import type { Prisma } from "@prisma/client";
import { resolveMediaUrl } from "./media";

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: { cover: true; category: true };
}>;

function mapArticleToCard(a: ArticleWithRelations): ArticleCardData {
  return {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    cover: resolveMediaUrl(a.cover?.url ?? a.ogImage) ?? null,
    categoryName: a.category?.name ?? null,
    categorySlug: a.category?.slug ?? null,
  };
}

function buildArticlesWhere(q?: string, categorySlug?: string): Prisma.ArticleWhereInput {
  const trimmed = q?.trim();
  return {
    status: "published",
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(trimmed && {
      OR: [
        { title: { contains: trimmed } },
        { excerpt: { contains: trimmed } },
      ],
    }),
  };
}

/** Recupere les cartes d'articles publies pour alimenter les blocs ArticleList. */
export async function getArticleCards(limit = 24): Promise<ArticleCardData[]> {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { cover: true, category: true },
  });

  return articles.map(mapArticleToCard);
}

/** Liste paginee d'articles avec recherche et filtre par categorie. */
export async function getArticlesPaginated({
  page = 1,
  pageSize = 10,
  q,
  categorySlug,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  categorySlug?: string;
}) {
  const safePage = Math.max(1, page);
  const where = buildArticlesWhere(q, categorySlug);

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: { cover: true, category: true },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items: articles.map(mapArticleToCard),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page: safePage,
  };
}

/** Categories ayant au moins un article publie. */
export async function getPublicCategories() {
  return prisma.category.findMany({
    where: { articles: { some: { status: "published" } } },
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });
}
