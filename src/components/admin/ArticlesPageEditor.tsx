"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveArticlesPage } from "@/app/admin/content-actions";
import { ArticleCard } from "@/components/site/ArticleCard";
import { ArticlesFilters } from "@/components/site/ArticlesFilters";
import type { ArticleCardData } from "@/puck/config";
import type { ArticlesPageConfig } from "@/lib/articles-page-config";
import {
  ARTICLES_CARD_STYLE_OPTIONS,
  ARTICLES_LAYOUT_OPTIONS,
  FILTERS_DIRECTION_OPTIONS,
  FILTERS_PLACEMENT_OPTIONS,
  layoutToGridClass,
} from "@/lib/articles-page-config";

type PageMeta = {
  id: string;
  title: string;
  status: "draft" | "published";
  showInNav: boolean;
  navOrder: number;
  metaTitle: string;
  metaDescription: string;
};

type Props = {
  initialConfig: ArticlesPageConfig;
  initialMeta: PageMeta;
  previewArticles: ArticleCardData[];
  categories: { slug: string; name: string }[];
};

export function ArticlesPageEditor({
  initialConfig,
  initialMeta,
  previewArticles,
  categories,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [config, setConfig] = useState(initialConfig);
  const [meta, setMeta] = useState(initialMeta);
  const [message, setMessage] = useState<string | null>(null);

  const updateConfig = (patch: Partial<ArticlesPageConfig>) =>
    setConfig((c) => ({ ...c, ...patch }));

  const updateNested = <
    K extends "search" | "categoryFilter" | "filters",
    P extends Partial<ArticlesPageConfig[K]>,
  >(
    key: K,
    patch: P,
  ) => setConfig((c) => ({ ...c, [key]: { ...c[key], ...patch } }));

  const save = (status: "draft" | "published") => {
    setMessage(null);
    startTransition(async () => {
      try {
        await saveArticlesPage({
          id: meta.id,
          title: meta.title,
          status,
          showInNav: meta.showInNav,
          navOrder: meta.navOrder,
          metaTitle: meta.metaTitle,
          metaDescription: meta.metaDescription,
          config: { ...config, title: config.title || meta.title },
        });
        setMeta((m) => ({ ...m, status }));
        setMessage(status === "published" ? "Page publiee" : "Brouillon enregistre");
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  const previewItems = previewArticles.slice(0, config.layout === "list" ? 3 : 6);
  const gridClass = layoutToGridClass(config.layout);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <Link href="/admin/pages" className="admin-btn admin-btn-sm">
            Retour
          </Link>
          <strong style={{ marginLeft: 12, fontSize: 18 }}>Page Articles</strong>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="admin-btn admin-btn-sm"
            disabled={pending}
            onClick={() => save("draft")}
          >
            Brouillon
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-sm admin-btn-primary"
            disabled={pending}
            onClick={() => save("published")}
          >
            {meta.status === "published" ? "Mettre a jour" : "Publier"}
          </button>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 380px) 1fr",
          gap: 0,
          minHeight: "calc(100vh - 57px)",
        }}
        className="articles-editor-layout"
      >
        <aside
          style={{
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            padding: 20,
            overflowY: "auto",
            maxHeight: "calc(100vh - 57px)",
          }}
        >
          <Section title="General">
            <Field label="Titre de la page">
              <input
                className="admin-input"
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
              />
            </Field>
            <label className="admin-row" style={{ gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={config.showTitle}
                onChange={(e) => updateConfig({ showTitle: e.target.checked })}
              />
              <span>Afficher le titre sur le site</span>
            </label>
            <Field label="Articles par page">
              <input
                className="admin-input"
                type="number"
                min={1}
                max={50}
                value={config.pageSize}
                onChange={(e) =>
                  updateConfig({ pageSize: Math.min(50, Math.max(1, Number(e.target.value) || 10)) })
                }
              />
            </Field>
          </Section>

          <Section title="Affichage des articles">
            <Field label="Disposition">
              <select
                className="admin-select"
                value={config.layout}
                onChange={(e) =>
                  updateConfig({ layout: e.target.value as ArticlesPageConfig["layout"] })
                }
              >
                {ARTICLES_LAYOUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Style des cartes">
              <select
                className="admin-select"
                value={config.cardStyle}
                onChange={(e) =>
                  updateConfig({ cardStyle: e.target.value as ArticlesPageConfig["cardStyle"] })
                }
              >
                {ARTICLES_CARD_STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Recherche et filtres">
            <label className="admin-row" style={{ gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={config.search.enabled}
                onChange={(e) => updateNested("search", { enabled: e.target.checked })}
              />
              <span>Barre de recherche</span>
            </label>
            {config.search.enabled && (
              <Field label="Placeholder recherche">
                <input
                  className="admin-input"
                  value={config.search.placeholder}
                  onChange={(e) => updateNested("search", { placeholder: e.target.value })}
                />
              </Field>
            )}
            <label className="admin-row" style={{ gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={config.categoryFilter.enabled}
                onChange={(e) => updateNested("categoryFilter", { enabled: e.target.checked })}
              />
              <span>Filtre par categorie</span>
            </label>
            {config.categoryFilter.enabled && (
              <Field label="Label option par defaut">
                <input
                  className="admin-input"
                  value={config.categoryFilter.label}
                  onChange={(e) => updateNested("categoryFilter", { label: e.target.value })}
                />
              </Field>
            )}
            <Field label="Emplacement des filtres">
              <select
                className="admin-select"
                value={config.filters.placement}
                onChange={(e) =>
                  updateNested("filters", {
                    placement: e.target.value as ArticlesPageConfig["filters"]["placement"],
                  })
                }
              >
                {FILTERS_PLACEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            {config.filters.placement === "top" && (
              <Field label="Disposition recherche / filtre">
                <select
                  className="admin-select"
                  value={config.filters.direction}
                  onChange={(e) =>
                    updateNested("filters", {
                      direction: e.target.value as ArticlesPageConfig["filters"]["direction"],
                    })
                  }
                >
                  {FILTERS_DIRECTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Les filtres s&apos;appliquent automatiquement, sans bouton.
            </p>
          </Section>

          <Section title="Navigation et SEO">
            <Field label="Titre admin">
              <input
                className="admin-input"
                value={meta.title}
                onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
              />
            </Field>
            <label className="admin-row" style={{ gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={meta.showInNav}
                onChange={(e) => setMeta((m) => ({ ...m, showInNav: e.target.checked }))}
              />
              <span>Afficher dans le menu</span>
            </label>
            <Field label="Ordre menu">
              <input
                className="admin-input"
                type="number"
                value={meta.navOrder}
                onChange={(e) => setMeta((m) => ({ ...m, navOrder: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Titre meta">
              <input
                className="admin-input"
                value={meta.metaTitle}
                onChange={(e) => setMeta((m) => ({ ...m, metaTitle: e.target.value }))}
              />
            </Field>
            <Field label="Description meta">
              <textarea
                className="admin-textarea"
                style={{ minHeight: 70, fontFamily: "inherit" }}
                value={meta.metaDescription}
                onChange={(e) => setMeta((m) => ({ ...m, metaDescription: e.target.value }))}
              />
            </Field>
          </Section>
        </aside>

        <div style={{ padding: 24, overflowY: "auto" }}>
          <div
            style={{
              background: "var(--color-bg)",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              minHeight: 400,
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              Apercu — /articles
            </div>
            <div style={{ padding: "32px 20px" }}>
              {config.showTitle && (
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--color-heading)",
                    fontFamily: "var(--font-heading)",
                    marginBottom: 20,
                  }}
                >
                  {config.title}
                </h1>
              )}

              {config.filters.placement === "sidebar-left" ||
              config.filters.placement === "sidebar-right" ? (
                <div
                  className={`articles-layout-sidebar${config.filters.placement === "sidebar-right" ? " articles-layout-sidebar-reverse" : ""}`}
                >
                  <aside className="articles-sidebar">
                    <ArticlesFilters
                      config={config}
                      initialQ=""
                      categories={categories}
                      preview
                    />
                  </aside>
                  <div className="articles-main">
                    <div className={gridClass} style={{ gap: config.layout === "list" ? 12 : 16 }}>
                      {previewItems.map((a) => (
                        <ArticleCard
                          key={a.slug}
                          article={a}
                          cardStyle={config.cardStyle}
                          layout={config.layout}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <ArticlesFilters
                      config={config}
                      initialQ=""
                      categories={categories}
                      preview
                    />
                  </div>
                  <div className={gridClass} style={{ gap: config.layout === "list" ? 12 : 16 }}>
                    {previewItems.map((a) => (
                      <ArticleCard
                        key={a.slug}
                        article={a}
                        cardStyle={config.cardStyle}
                        layout={config.layout}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            background: "#111827",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            zIndex: 10001,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <strong style={{ display: "block", marginBottom: 12, fontSize: 14 }}>{title}</strong>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {children}
    </div>
  );
}
