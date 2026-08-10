import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchive } from "@/components/site/ArticlesArchive";
import { ensureArticlesPage, getArticlesPage } from "@/lib/articles-page";
import { parseArticlesPageConfig } from "@/lib/articles-page-config";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getArticlesPage(), getSetting("site")]);
  const config = page ? parseArticlesPageConfig(page.puckData) : null;
  const title = page?.metaTitle || config?.title || "Tous les articles";

  return {
    title,
    description:
      page?.metaDescription ||
      "Parcourez tous les articles du blog avec recherche et filtres par categorie.",
    openGraph: {
      title: page?.metaTitle || `${config?.title || "Tous les articles"} - ${site.title}`,
      description: page?.metaDescription || undefined,
      type: "website",
    },
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const { page: pageParam, q, category } = await searchParams;
  const pageNum = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const query = (q || "").trim();

  const cmsPage = await ensureArticlesPage();
  if (cmsPage.status !== "published") notFound();

  const config = parseArticlesPageConfig(cmsPage.puckData);

  return <ArticlesArchive config={config} page={pageNum} q={query} category={category} />;
}
