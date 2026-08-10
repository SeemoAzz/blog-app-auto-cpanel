import Link from "next/link";
import type { CSSProperties } from "react";
import type { ArticleCardData } from "@/puck/config";
import type { ArticlesCardStyle, ArticlesLayout } from "@/lib/articles-page-config";

type Props = {
  article: ArticleCardData;
  cardStyle?: ArticlesCardStyle;
  layout?: ArticlesLayout;
};

const coverFallback = (
  <div
    style={{
      width: "100%",
      height: "100%",
      minHeight: 120,
      background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    }}
  />
);

function CoverImage({ src, alt, style }: { src: string; alt: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />
  );
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--color-primary)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {name}
    </span>
  );
}

function HorizontalCard({ article, cardStyle }: { article: ArticleCardData; cardStyle: ArticlesCardStyle }) {
  const isMinimal = cardStyle === "minimal";
  const isBordered = cardStyle === "bordered";
  const isAccent = cardStyle === "accent";

  return (
    <Link
      href={`/article/${article.slug}`}
      className="articles-list-item"
      style={{
        textDecoration: "none",
        color: "inherit",
        background: isMinimal ? "transparent" : "var(--color-surface)",
        border: isMinimal ? "none" : `${isBordered ? 2 : 1}px solid ${isBordered ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: isMinimal ? 0 : "calc(var(--radius) + 4px)",
        overflow: "hidden",
        display: "flex",
        gap: 0,
        borderLeft: isAccent ? "4px solid var(--color-primary)" : undefined,
      }}
    >
      <div style={{ width: 200, flexShrink: 0, minHeight: 130 }}>
        {article.cover ? (
          <CoverImage src={article.cover} alt={article.title} style={{ minHeight: 130 }} />
        ) : (
          coverFallback
        )}
      </div>
      <div style={{ padding: isMinimal ? "12px 16px" : 16, flex: 1, minWidth: 0 }}>
        {article.categoryName && <CategoryBadge name={article.categoryName} />}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-heading)",
            fontSize: 18,
            fontWeight: 700,
            margin: "6px 0",
          }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p style={{ color: "var(--color-muted)", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

function OverlayCard({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        borderRadius: "calc(var(--radius) + 4px)",
        overflow: "hidden",
        display: "block",
        position: "relative",
        minHeight: 240,
      }}
    >
      {article.cover ? (
        <CoverImage src={article.cover} alt={article.title} style={{ position: "absolute", inset: 0, minHeight: 240 }} />
      ) : (
        <div style={{ position: "absolute", inset: 0 }}>{coverFallback}</div>
      )}
      <div
        style={{
          position: "relative",
          marginTop: 140,
          padding: "48px 16px 16px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.82))",
          color: "#fff",
        }}
      >
        {article.categoryName && (
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", opacity: 0.9 }}>
            {article.categoryName}
          </span>
        )}
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, margin: "4px 0" }}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9, margin: 0 }}>{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

function GridCard({ article, cardStyle }: { article: ArticleCardData; cardStyle: ArticlesCardStyle }) {
  if (cardStyle === "overlay") return <OverlayCard article={article} />;

  const isMinimal = cardStyle === "minimal";
  const isBordered = cardStyle === "bordered";
  const isAccent = cardStyle === "accent";

  return (
    <Link
      href={`/article/${article.slug}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        background: isMinimal ? "transparent" : "var(--color-surface)",
        border: isMinimal ? "none" : `${isBordered ? 2 : 1}px solid ${isBordered ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: isMinimal ? 0 : "calc(var(--radius) + 4px)",
        overflow: "hidden",
        display: "block",
        borderTop: isAccent ? "4px solid var(--color-primary)" : undefined,
      }}
    >
      <div style={{ height: 160, overflow: "hidden" }}>
        {article.cover ? (
          <CoverImage src={article.cover} alt={article.title} style={{ height: 160 }} />
        ) : (
          coverFallback
        )}
      </div>
      <div style={{ padding: isMinimal ? "12px 0" : 16 }}>
        {article.categoryName && <CategoryBadge name={article.categoryName} />}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-heading)",
            fontSize: 18,
            fontWeight: 700,
            margin: "6px 0",
          }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p style={{ color: "var(--color-muted)", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ArticleCard({ article, cardStyle = "classic", layout = "grid-3" }: Props) {
  if (layout === "list") {
    return <HorizontalCard article={article} cardStyle={cardStyle} />;
  }
  return <GridCard article={article} cardStyle={cardStyle} />;
}
