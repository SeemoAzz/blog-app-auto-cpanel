import { getSetting } from "@/lib/settings";
import { getArticleCards } from "@/lib/public-data";
import { emptyData } from "@/puck/config";
import { ContentEditor } from "@/components/editor/ContentEditor";

export const dynamic = "force-dynamic";

export default async function NewPagePage() {
  const [adsense, previewArticles] = await Promise.all([
    getSetting("adsense"),
    getArticleCards(),
  ]);

  return (
    <ContentEditor
      kind="page"
      initialData={emptyData("Nouvelle page")}
      initialMeta={{
        title: "Nouvelle page",
        path: "",
        status: "draft",
        locale: "fr",
        showInNav: false,
        navOrder: 0,
      }}
      previewArticles={previewArticles}
      adsenseClientId={adsense.enabled ? adsense.clientId : ""}
    />
  );
}
