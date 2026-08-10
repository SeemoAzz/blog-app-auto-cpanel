import { notFound } from "next/navigation";
import type { Data } from "@puckeditor/core";
import { prisma } from "@/lib/prisma";
import { isArticlesPage } from "@/lib/articles-page";
import { parseArticlesPageConfig } from "@/lib/articles-page-config";
import { getSetting } from "@/lib/settings";
import { getArticleCards, getPublicCategories } from "@/lib/public-data";
import { emptyData } from "@/puck/config";
import { ArticlesPageEditor } from "@/components/admin/ArticlesPageEditor";
import { ContentEditor } from "@/components/editor/ContentEditor";

export const dynamic = "force-dynamic";

function parseData(json: string): Data {
  try {
    const d = JSON.parse(json);
    if (d && Array.isArray(d.content)) return d as Data;
  } catch {}
  return emptyData();
}

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) notFound();

  if (isArticlesPage(page)) {
    const [previewArticles, categories, adsense] = await Promise.all([
      getArticleCards(8),
      getPublicCategories(),
      getSetting("adsense"),
    ]);

    return (
      <ArticlesPageEditor
        initialConfig={parseArticlesPageConfig(page.puckData)}
        initialMeta={{
          id: page.id,
          title: page.title,
          status: page.status as "draft" | "published",
          showInNav: page.showInNav,
          navOrder: page.navOrder,
          metaTitle: page.metaTitle || "",
          metaDescription: page.metaDescription || "",
        }}
        previewArticles={previewArticles}
        categories={categories}
        adsenseClientId={adsense.enabled ? adsense.clientId : ""}
      />
    );
  }

  const [adsense, previewArticles] = await Promise.all([
    getSetting("adsense"),
    getArticleCards(),
  ]);

  return (
    <ContentEditor
      kind="page"
      initialData={parseData(page.puckData)}
      initialMeta={{
        id: page.id,
        title: page.title,
        path: page.path,
        status: page.status as "draft" | "published",
        locale: page.locale,
        isHome: page.isHome,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        ogImage: page.ogImage || "",
      }}
      previewArticles={previewArticles}
      adsenseClientId={adsense.enabled ? adsense.clientId : ""}
    />
  );
}
