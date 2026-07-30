import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { getArticleCards } from "@/lib/public-data";
import { emptyData } from "@/puck/config";
import { ContentEditor } from "@/components/editor/ContentEditor";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, adsense, previewArticles] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSetting("adsense"),
    getArticleCards(),
  ]);

  return (
    <ContentEditor
      kind="article"
      initialData={emptyData("Nouvel article")}
      initialMeta={{
        title: "Nouvel article",
        status: "draft",
        locale: "fr",
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      previewArticles={previewArticles}
      adsenseClientId={adsense.enabled ? adsense.clientId : ""}
    />
  );
}
