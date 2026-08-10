"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ArticlesPageConfig } from "@/lib/articles-page-config";

type Category = { slug: string; name: string };

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  padding: "12px 14px",
  fontSize: 16,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  width: "100%",
};

function buildUrl(q: string, category: string) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

export function ArticlesFilters({
  config,
  initialQ,
  initialCategory,
  categories,
  preview = false,
}: {
  config: ArticlesPageConfig;
  initialQ: string;
  initialCategory?: string;
  categories: Category[];
  preview?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const category = initialCategory || "";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  const navigate = useCallback(
    (nextQ: string, nextCategory: string) => {
      if (preview) return;
      startTransition(() => {
        router.push(buildUrl(nextQ, nextCategory));
      });
    },
    [router, preview],
  );

  const onSearchChange = (value: string) => {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value, category), 400);
  };

  const onCategoryChange = (value: string) => {
    navigate(q, value);
  };

  const hasFilters = Boolean(initialQ || initialCategory);
  const showSearch = config.search.enabled;
  const showCategory = config.categoryFilter.enabled;
  const isColumn = config.filters.direction === "column";
  const isSidebar =
    config.filters.placement === "sidebar-left" ||
    config.filters.placement === "sidebar-right";

  if (!showSearch && !showCategory) return null;

  return (
    <div
      className={isSidebar ? "articles-filters-sidebar" : undefined}
      style={{
        display: "flex",
        flexDirection: isColumn ? "column" : "row",
        flexWrap: isColumn ? "nowrap" : "wrap",
        gap: isSidebar ? 12 : 8,
        alignItems: isColumn ? "stretch" : "center",
        opacity: pending ? 0.7 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {showSearch && (
        <input
          type="search"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={config.search.placeholder}
          aria-label="Rechercher"
          style={{
            ...inputStyle,
            flex: isColumn || isSidebar ? "1 1 auto" : "1 1 220px",
            minWidth: isSidebar ? 0 : 180,
          }}
        />
      )}
      {showCategory && (
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filtrer par categorie"
          style={{
            ...inputStyle,
            flex: isColumn || isSidebar ? "1 1 auto" : "0 1 220px",
            cursor: "pointer",
            minWidth: isSidebar ? 0 : 160,
          }}
        >
          <option value="">{config.categoryFilter.label}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            navigate("", "");
          }}
          style={{
            ...inputStyle,
            flex: "0 0 auto",
            cursor: "pointer",
            color: "var(--color-muted)",
            background: "transparent",
            alignSelf: isColumn ? "flex-start" : undefined,
          }}
        >
          Reinitialiser
        </button>
      )}
    </div>
  );
}
