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

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, adsense, previewArticles] = await Promise.all([
    prisma.page.findUnique({ where: { id } }),
    getSetting("adsense"),
    getArticleCards(),
  ]);

  if (!page) notFound();

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
