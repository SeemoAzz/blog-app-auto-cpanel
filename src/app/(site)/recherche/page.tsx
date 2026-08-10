import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const results = query
    ? await prisma.article.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        include: { cover: true, category: true },
        take: 30,
      })
    : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", minHeight: "50vh" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)" }}>
        Recherche
      </h1>

      <form action="/recherche" style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        <input
          name="q"
          defaultValue={query}
          placeholder="Rechercher un article..."
          style={{
            flex: 1,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            padding: "12px 14px",
            fontSize: 16,
            background: "var(--color-surface)",
            color: "var(--color-text)",
          }}
        />
        <button
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-contrast)",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "12px 24px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Rechercher
        </button>
      </form>

      {query && (
        <p style={{ color: "var(--color-muted)", marginBottom: 20 }}>
          {results.length} resultat(s) pour &laquo; {query} &raquo;
        </p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {results.map((a) => (
          <Link
            key={a.id}
            href={`/article/${a.slug}`}
            style={{
              display: "flex",
              gap: 16,
              textDecoration: "none",
              color: "inherit",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "calc(var(--radius) + 4px)",
              overflow: "hidden",
            }}
          >
            {a.cover?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.cover.url} alt={a.title} style={{ width: 160, height: 110, objectFit: "cover" }} />
            )}
            <div style={{ padding: 14 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 18, fontWeight: 700 }}>
                {a.title}
              </h2>
              {a.excerpt && <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 4 }}>{a.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
