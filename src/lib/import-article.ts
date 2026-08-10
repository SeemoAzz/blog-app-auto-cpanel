import "server-only";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { rewriteArticleFromSource, type ContentBlock } from "@/lib/ai/rewrite-article";
import { articleToPuckData } from "@/lib/ai/to-puck";

export type ImportArticlePayload = {
  title: string;
  content?: string;
  contentBlocks?: ContentBlock[];
  sourceUrl?: string;
  author?: string;
  siteName?: string;
  language?: string;
  tone?: string;
  withHeroImage?: boolean;
  sectionImages?: boolean;
  categorySlug?: string;
  externalId?: string;
  publish?: boolean;
};

function makeSlug(input: string): string {
  const s = slugify(input || "", { lower: true, strict: true, locale: "fr" });
  return s || `article-${Date.now().toString(36)}`;
}

async function uniqueArticleSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function importArticleAsDraft(payload: ImportArticlePayload) {
  if (!(await isAiConfigured())) {
    throw new Error("IA non configuree. Ajoute ta cle API OpenRouter dans Admin > Reglages.");
  }

  const aiArticle = await rewriteArticleFromSource({
    title: payload.title,
    content: payload.content,
    contentBlocks: payload.contentBlocks,
    sourceUrl: payload.sourceUrl,
    author: payload.author,
    siteName: payload.siteName,
    language: payload.language,
    tone: payload.tone,
    withHeroImage: payload.withHeroImage,
    sectionImages: payload.sectionImages,
  });

  const puckData = articleToPuckData(aiArticle, { includeAds: true });
  const slug = await uniqueArticleSlug(makeSlug(aiArticle.title));

  let categoryId: string | null = null;
  if (payload.categorySlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: payload.categorySlug },
    });
    categoryId = cat?.id ?? null;
  }

  let coverMediaId: string | null = null;
  if (aiArticle.heroImage) {
    const media = await prisma.media.findFirst({
      where: { url: aiArticle.heroImage },
    });
    coverMediaId = media?.id ?? null;
  }

  const published = payload.publish === true;

  const article = await prisma.article.create({
    data: {
      title: aiArticle.title,
      slug,
      excerpt: aiArticle.excerpt || null,
      status: published ? "published" : "draft",
      publishedAt: published ? new Date() : null,
      locale: payload.language || "fr",
      puckData: JSON.stringify(puckData),
      metaTitle: aiArticle.metaTitle || null,
      metaDescription: aiArticle.metaDescription || null,
      ogImage: aiArticle.heroImage || null,
      coverMediaId,
      categoryId,
    },
  });

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    status: article.status,
  };
}
