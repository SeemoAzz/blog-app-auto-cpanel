import "server-only";
import { resolveMediaUrl } from "@/lib/media";

type PuckBlock = {
  type?: string;
  props?: { media?: string };
};

type ArticleForExport = {
  title: string;
  slug: string;
  ogImage: string | null;
  puckData: string;
  cover?: { url: string } | null;
};

function extractHeroMediaFromPuck(puckDataJson: string): string | null {
  try {
    const data = JSON.parse(puckDataJson) as { content?: PuckBlock[] };
    const hero = data.content?.find((block) => block.type === "Hero");
    const media = hero?.props?.media?.trim();
    return media || null;
  } catch {
    return null;
  }
}

export function resolveArticleHeroImage(article: ArticleForExport): string | null {
  const fromCover = resolveMediaUrl(article.cover?.url);
  if (fromCover) return fromCover;

  const fromOg = resolveMediaUrl(article.ogImage);
  if (fromOg) return fromOg;

  const fromPuck = extractHeroMediaFromPuck(article.puckData);
  return resolveMediaUrl(fromPuck);
}

export function toAbsoluteUrl(path: string, baseUrl: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
