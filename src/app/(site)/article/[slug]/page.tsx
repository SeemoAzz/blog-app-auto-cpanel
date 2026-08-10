import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { splitArticleByParts } from "@/lib/article-parts";
import { getSetting } from "@/lib/settings";
import { PublicRender } from "@/components/PublicRender";
import { ArticlePaginatedReader } from "@/components/site/ArticlePaginatedReader";

export const dynamic = "force-dynamic";

type Params = { slug: string };

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "published" },
    include: { cover: true, category: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article introuvable" };
  const site = await getSetting("site");
  const image = article.ogImage || article.cover?.url || undefined;
  return {
    title: article.metaTitle || `${article.title} - ${site.title}`,
    description: article.metaDescription || article.excerpt || undefined,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [site, adsense] = await Promise.all([getSetting("site"), getSetting("adsense")]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const image = article.ogImage || article.cover?.url || undefined;
  const { parts, breaks } = splitArticleByParts(article.puckData);
  const adsenseClientId = adsense.enabled ? adsense.clientId : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.metaDescription || undefined,
    image: image ? [image.startsWith("http") ? image : siteUrl + image] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: site.title },
    publisher: { "@type": "Organization", name: site.title },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/article/${article.slug}`,
    },
  };

  const content =
    parts.length <= 1 ? (
      <PublicRender puckData={article.puckData} />
    ) : (
      <ArticlePaginatedReader
        breaks={breaks}
        adsenseClientId={adsenseClientId}
        totalParts={parts.length}
      >
        {parts.map((part, i) => (
          <PublicRender key={i} puckData={JSON.stringify(part)} />
        ))}
      </ArticlePaginatedReader>
    );

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="article-meta">
        {article.category && (
          <span
            style={{
              color: "var(--color-primary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {article.category.name}
          </span>
        )}
        {article.publishedAt && (
          <time dateTime={article.publishedAt.toISOString()}>
            {article.publishedAt.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>

      <div className="article-body">{content}</div>
    </article>
  );
}
