import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { PublicRender } from "@/components/PublicRender";

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

  const [site] = await Promise.all([getSetting("site")]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const image = article.ogImage || article.cover?.url || undefined;

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

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "32px 20px 0",
          color: "var(--color-muted)",
          fontSize: 14,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
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

      <PublicRender puckData={article.puckData} />
    </article>
  );
}
