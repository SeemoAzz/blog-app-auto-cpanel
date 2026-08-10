import { ArticleCard } from "@/components/site/ArticleCard";
import { ArticlesAdCard } from "@/components/site/ArticlesAdCard";
import type { ArticlesPageConfig } from "@/lib/articles-page-config";
import { layoutToGridClass } from "@/lib/articles-page-config";
import { buildArticlesGridItems } from "@/lib/articles-page-ads";
import type { ArticleCardData } from "@/puck/config";

type Props = {
  config: ArticlesPageConfig;
  articles: ArticleCardData[];
  clientId?: string;
  preview?: boolean;
};

export function ArticlesItemsGrid({ config, articles, clientId, preview = false }: Props) {
  if (articles.length === 0) return null;

  const gridClass = layoutToGridClass(config.layout);
  const gap = config.layout === "list" ? 12 : 20;
  const items = buildArticlesGridItems(articles, config.ads);

  return (
    <div className={gridClass} style={{ gap }}>
      {items.map((item) =>
        item.type === "article" ? (
          <ArticleCard
            key={item.article.slug}
            article={item.article}
            cardStyle={config.cardStyle}
            layout={config.layout}
          />
        ) : (
          <ArticlesAdCard
            key={item.key}
            slot={item.slot}
            clientId={clientId}
            cardStyle={config.cardStyle}
            layout={config.layout}
            preview={preview}
          />
        ),
      )}
    </div>
  );
}
