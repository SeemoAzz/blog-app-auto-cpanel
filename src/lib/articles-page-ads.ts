import type { ArticleCardData } from "@/puck/config";
import type { ArticlesPageAdSlot, ArticlesPageConfig } from "@/lib/articles-page-config";

export type ArticlesGridItem =
  | { type: "article"; article: ArticleCardData }
  | { type: "ad"; slot: ArticlesPageAdSlot; key: string };

export function buildArticlesGridItems(
  articles: ArticleCardData[],
  ads: ArticlesPageConfig["ads"],
): ArticlesGridItem[] {
  if (!ads.enabled || ads.slots.length === 0) {
    return articles.map((article) => ({ type: "article", article }));
  }

  const activeSlots = ads.slots.filter((slot) => slot.every > 0);
  if (activeSlots.length === 0) {
    return articles.map((article) => ({ type: "article", article }));
  }

  const items: ArticlesGridItem[] = [];
  for (let i = 0; i < articles.length; i++) {
    items.push({ type: "article", article: articles[i] });
    const articleNum = i + 1;
    const slot = activeSlots.find((s) => articleNum % s.every === 0);
    if (slot) {
      items.push({ type: "ad", slot, key: `ad-${slot.id}-${articleNum}` });
    }
  }
  return items;
}

export function createArticlesPageAdSlot(
  partial: Partial<Omit<ArticlesPageAdSlot, "id">> = {},
): ArticlesPageAdSlot {
  return {
    id: crypto.randomUUID(),
    every: partial.every ?? 4,
    slotId: partial.slotId ?? "",
    format: partial.format ?? "rectangle",
    label: partial.label ?? "Publicite",
  };
}
