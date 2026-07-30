import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [pages, articles] = await Promise.all([
    prisma.page.findMany({
      where: { status: "published" },
      select: { path: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${base}${p.path === "/" ? "" : p.path}`,
    lastModified: p.updatedAt,
    changeFrequency: p.path === "/" ? "daily" : "monthly",
    priority: p.path === "/" ? 1 : 0.6,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/article/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pageEntries, ...articleEntries];
}
