import type { CSSProperties } from "react";
import Link from "next/link";
import { ArticlesFilters } from "@/components/site/ArticlesFilters";
import { ArticlesItemsGrid } from "@/components/site/ArticlesItemsGrid";
import type { ArticlesPageConfig } from "@/lib/articles-page-config";
import { getArticlesPaginated, getPublicCategories } from "@/lib/public-data";
import { getSetting } from "@/lib/settings";

const inputStyle: CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  padding: "12px 14px",
  fontSize: 16,
  background: "var(--color-surface)",
  color: "var(--color-text)",
};

function buildArticlesUrl(params: { page?: number; q?: string; category?: string }) {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.category) search.set("category", params.category);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

function Pagination({
  page,
  totalPages,
  q,
  category,
}: {
  page: number;
  totalPages: number;
  q: string;
  category?: string;
}) {
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pageNumbers.push(i);
    }
  }

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
      }}
    >
      {page > 1 ? (
        <Link
          href={buildArticlesUrl({ page: page - 1, q, category })}
          style={{ ...inputStyle, textDecoration: "none", fontWeight: 600 }}
        >
          Precedent
        </Link>
      ) : (
        <span style={{ ...inputStyle, opacity: 0.4, cursor: "default" }}>Precedent</span>
      )}

      {pageNumbers.map((n, i) => {
        const prev = pageNumbers[i - 1];
        const showEllipsis = prev !== undefined && n - prev > 1;
        return (
          <span key={n} style={{ display: "contents" }}>
            {showEllipsis && (
              <span style={{ color: "var(--color-muted)", padding: "0 4px" }}>...</span>
            )}
            {n === page ? (
              <span
                style={{
                  ...inputStyle,
                  background: "var(--color-primary)",
                  color: "var(--color-primary-contrast)",
                  fontWeight: 700,
                }}
              >
                {n}
              </span>
            ) : (
              <Link
                href={buildArticlesUrl({ page: n, q, category })}
                style={{ ...inputStyle, textDecoration: "none", fontWeight: 600 }}
              >
                {n}
              </Link>
            )}
          </span>
        );
      })}

      {page < totalPages ? (
        <Link
          href={buildArticlesUrl({ page: page + 1, q, category })}
          style={{ ...inputStyle, textDecoration: "none", fontWeight: 600 }}
        >
          Suivant
        </Link>
      ) : (
        <span style={{ ...inputStyle, opacity: 0.4, cursor: "default" }}>Suivant</span>
      )}
    </nav>
  );
}

export async function ArticlesArchive({
  config,
  page,
  q,
  category,
}: {
  config: ArticlesPageConfig;
  page: number;
  q: string;
  category?: string;
}) {
  const pageSize = Math.min(50, Math.max(1, config.pageSize || 10));

  const [{ items, total, totalPages }, categories, adsense] = await Promise.all([
    getArticlesPaginated({ page, pageSize, q, categorySlug: category }),
    getPublicCategories(),
    getSetting("adsense"),
  ]);

  const adsenseClientId = adsense.enabled ? adsense.clientId : "";

  const hasFilters = Boolean(q || category);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const filters = (
    <ArticlesFilters
      config={config}
      initialQ={q}
      initialCategory={category}
      categories={categories}
    />
  );

  const resultsSummary = (
    <p style={{ color: "var(--color-muted)", margin: "0 0 24px" }}>
      {total === 0
        ? hasFilters
          ? "Aucun article ne correspond a votre recherche."
          : "Aucun article pour le moment."
        : totalPages > 1
          ? `${start}–${end} sur ${total} article${total > 1 ? "s" : ""}`
          : `${total} article${total > 1 ? "s" : ""}`}
    </p>
  );

  const grid = (
    <ArticlesItemsGrid config={config} articles={items} clientId={adsenseClientId} />
  );
  const pagination = totalPages > 1 ? (
    <Pagination page={page} totalPages={totalPages} q={q} category={category} />
  ) : null;

  const isSidebar =
    config.filters.placement === "sidebar-left" ||
    config.filters.placement === "sidebar-right";

  return (
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px", minHeight: "50vh" }}>
      {config.showTitle && (
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--color-heading)",
            fontFamily: "var(--font-heading)",
            marginBottom: 24,
          }}
        >
          {config.title}
        </h1>
      )}

      {isSidebar ? (
        <div
          className={`articles-layout-sidebar${config.filters.placement === "sidebar-right" ? " articles-layout-sidebar-reverse" : ""}`}
        >
          <aside className="articles-sidebar">{filters}</aside>
          <div className="articles-main">
            {resultsSummary}
            {grid}
            {pagination}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>{filters}</div>
          {resultsSummary}
          {grid}
          {pagination}
        </>
      )}
    </section>
  );
}
