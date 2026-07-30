import { Render } from "@puckeditor/core/rsc";
import type { Data } from "@puckeditor/core";
import { config } from "@/puck/config";
import { getArticleCards } from "@/lib/public-data";
import { getSetting } from "@/lib/settings";

function safeParse(json: string): Data {
  try {
    const data = JSON.parse(json);
    if (data && typeof data === "object" && Array.isArray(data.content)) {
      return data as Data;
    }
  } catch {
    // ignore
  }
  return { root: { props: {} }, content: [], zones: {} } as Data;
}

/**
 * Rendu serveur (SSR/SSG) d'un contenu Puck pour le site public.
 * Injecte l'ID AdSense et la liste d'articles via metadata.
 */
export async function PublicRender({ puckData }: { puckData: string }) {
  const data = safeParse(puckData);

  const [adsense, articles] = await Promise.all([
    getSetting("adsense"),
    getArticleCards(),
  ]);

  return (
    <Render
      config={config}
      data={data}
      metadata={{
        adsenseClientId: adsense.enabled ? adsense.clientId : "",
        articles,
      }}
    />
  );
}
