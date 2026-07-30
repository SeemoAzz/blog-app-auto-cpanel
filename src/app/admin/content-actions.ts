"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Non autorise");
  return session;
}

function makeSlug(input: string): string {
  const s = slugify(input || "", { lower: true, strict: true, locale: "fr" });
  return s || `contenu-${Date.now().toString(36)}`;
}

async function uniqueArticleSlug(base: string, id?: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${base}-${i++}`;
  }
}

async function uniquePagePath(base: string, id?: string): Promise<string> {
  let path = base;
  let i = 2;
  while (true) {
    const existing = await prisma.page.findUnique({ where: { path } });
    if (!existing || existing.id === id) return path;
    path = `${base}-${i++}`;
  }
}

export type SaveArticleInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  status: "draft" | "published";
  locale?: string;
  categoryId?: string | null;
  coverMediaId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  data: unknown;
};

export async function saveArticle(input: SaveArticleInput) {
  await requireAuth();

  const title = input.title?.trim() || "Sans titre";
  const baseSlug = makeSlug(input.slug || title);
  const slug = await uniqueArticleSlug(baseSlug, input.id);
  const puckData = JSON.stringify(input.data ?? {});

  const common = {
    title,
    slug,
    excerpt: input.excerpt || null,
    status: input.status,
    locale: input.locale || "fr",
    categoryId: input.categoryId || null,
    coverMediaId: input.coverMediaId || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    ogImage: input.ogImage || null,
    puckData,
  };

  let article;
  if (input.id) {
    const before = await prisma.article.findUnique({ where: { id: input.id } });
    article = await prisma.article.update({
      where: { id: input.id },
      data: {
        ...common,
        publishedAt:
          input.status === "published"
            ? before?.publishedAt ?? new Date()
            : before?.publishedAt ?? null,
      },
    });
  } else {
    article = await prisma.article.create({
      data: {
        ...common,
        publishedAt: input.status === "published" ? new Date() : null,
      },
    });
  }

  revalidatePath("/");
  revalidatePath(`/article/${article.slug}`);
  return { ok: true as const, id: article.id, slug: article.slug };
}

export async function deleteArticle(id: string) {
  await requireAuth();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true as const };
}

export type SavePageInput = {
  id?: string;
  title: string;
  path?: string;
  status: "draft" | "published";
  locale?: string;
  isHome?: boolean;
  showInNav?: boolean;
  navOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  data: unknown;
};

export async function savePage(input: SavePageInput) {
  await requireAuth();

  const title = input.title?.trim() || "Sans titre";
  let basePath: string;
  if (input.isHome) {
    basePath = "/";
  } else {
    const raw = (input.path || title).trim();
    const cleaned = raw.startsWith("/") ? raw.slice(1) : raw;
    basePath = "/" + makeSlug(cleaned);
  }
  const path = await uniquePagePath(basePath, input.id);
  const puckData = JSON.stringify(input.data ?? {});

  // Une seule page d'accueil possible
  if (input.isHome) {
    await prisma.page.updateMany({
      where: { isHome: true, NOT: input.id ? { id: input.id } : undefined },
      data: { isHome: false },
    });
  }

  const common = {
    title,
    path,
    status: input.status,
    locale: input.locale || "fr",
    isHome: !!input.isHome,
    showInNav: !!input.showInNav,
    navOrder: input.navOrder ?? 0,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    ogImage: input.ogImage || null,
    puckData,
  };

  let page;
  if (input.id) {
    page = await prisma.page.update({ where: { id: input.id }, data: common });
  } else {
    page = await prisma.page.create({ data: common });
  }

  revalidatePath("/");
  revalidatePath(page.path);
  return { ok: true as const, id: page.id, path: page.path };
}

export async function deletePage(id: string) {
  await requireAuth();
  const page = await prisma.page.findUnique({ where: { id } });
  await prisma.page.delete({ where: { id } });
  revalidatePath("/");
  if (page) revalidatePath(page.path);
  return { ok: true as const };
}
