"use client";

import "@puckeditor/core/puck.css";
import { Puck } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { config } from "@/puck/config";
import type { ArticleCardData } from "@/puck/config";
import { MediaPickerModal } from "@/components/MediaPicker";
import {
  saveArticle,
  savePage,
  type SaveArticleInput,
  type SavePageInput,
} from "@/app/admin/content-actions";
import { ARTICLES_PAGE_PATH } from "@/lib/articles-page";

export type EditorMeta = {
  id?: string;
  title: string;
  slug?: string; // articles
  path?: string; // pages
  excerpt?: string;
  status: "draft" | "published";
  locale: string;
  categoryId?: string | null;
  coverMediaId?: string | null;
  coverUrl?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isHome?: boolean;
  showInNav?: boolean;
  navOrder?: number;
};

type Props = {
  kind: "article" | "page";
  initialData: Data;
  initialMeta: EditorMeta;
  categories?: { id: string; name: string }[];
  previewArticles?: ArticleCardData[];
  adsenseClientId?: string;
};

const LOCALES = [
  { value: "fr", label: "Francais" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "ar", label: "Arabe" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
  { value: "pt", label: "Portugais" },
];

export function ContentEditor({
  kind,
  initialData,
  initialMeta,
  categories = [],
  previewArticles = [],
  adsenseClientId = "",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const dataRef = useRef<Data>(initialData);
  const [id, setId] = useState<string | undefined>(initialMeta.id);
  const [meta, setMeta] = useState<EditorMeta>(initialMeta);
  const [showSettings, setShowSettings] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const update = (patch: Partial<EditorMeta>) =>
    setMeta((m) => ({ ...m, ...patch }));

  const doSave = (status: "draft" | "published", latest?: Data) => {
    const data = latest || dataRef.current;
    setMessage(null);
    startTransition(async () => {
      try {
        if (kind === "article") {
          const input: SaveArticleInput = {
            id,
            title: meta.title,
            slug: meta.slug,
            excerpt: meta.excerpt,
            status,
            locale: meta.locale,
            categoryId: meta.categoryId ?? null,
            coverMediaId: meta.coverMediaId ?? null,
            metaTitle: meta.metaTitle,
            metaDescription: meta.metaDescription,
            ogImage: meta.ogImage,
            data,
          };
          const res = await saveArticle(input);
          finishSave(res.id, status, res.slug);
        } else {
          const input: SavePageInput = {
            id,
            title: meta.title,
            path: meta.path,
            status,
            locale: meta.locale,
            isHome: meta.isHome,
            showInNav: meta.showInNav,
            navOrder: meta.navOrder,
            metaTitle: meta.metaTitle,
            metaDescription: meta.metaDescription,
            ogImage: meta.ogImage,
            data,
          };
          const res = await savePage(input);
          finishSave(res.id, status, res.path);
        }
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Erreur d'enregistrement");
      }
    });
  };

  const finishSave = (newId: string, status: string, ref: string) => {
    setMeta((m) => ({ ...m, status: status as EditorMeta["status"] }));
    setMessage(
      `Enregistre (${status === "published" ? "publie" : "brouillon"}) - ${ref}`,
    );
    if (!id) {
      setId(newId);
      const base = kind === "article" ? "articles" : "pages";
      router.replace(`/admin/${base}/${newId}`);
    }
    router.refresh();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Puck
        config={config}
        data={initialData}
        onChange={(d) => {
          dataRef.current = d;
        }}
        onPublish={(d) => doSave("published", d)}
        iframe={{ enabled: false }}
        metadata={{ adsenseClientId, articles: previewArticles }}
        headerTitle={meta.title || (kind === "article" ? "Article" : "Page")}
        headerPath={kind === "article" ? `/article/${meta.slug || ""}` : meta.path}
        renderHeaderActions={() => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href={kind === "article" ? "/admin/articles" : "/admin/pages"}
              className="admin-btn admin-btn-sm"
            >
              Retour
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => setShowSettings(true)}
            >
              Parametres
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              disabled={pending}
              onClick={() => doSave("draft")}
            >
              {pending ? "..." : "Brouillon"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-primary"
              disabled={pending}
              onClick={() => doSave("published")}
            >
              {pending ? "..." : meta.status === "published" ? "Mettre a jour" : "Publier"}
            </button>
          </div>
        )}
      />

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
            maxWidth: 400,
          }}
        >
          {message}
        </div>
      )}

      {showSettings && (
        <SettingsModal
          kind={kind}
          meta={meta}
          categories={categories}
          locales={LOCALES}
          onChange={update}
          onOpenCover={() => setShowCover(true)}
          onClose={() => setShowSettings(false)}
        />
      )}

      <MediaPickerModal
        open={showCover}
        onClose={() => setShowCover(false)}
        onSelect={(item) =>
          update({ coverMediaId: item.id, coverUrl: item.url })
        }
      />
    </div>
  );
}

function SettingsModal({
  kind,
  meta,
  categories,
  locales,
  onChange,
  onOpenCover,
  onClose,
}: {
  kind: "article" | "page";
  meta: EditorMeta;
  categories: { id: string; name: string }[];
  locales: { value: string; label: string }[];
  onChange: (patch: Partial<EditorMeta>) => void;
  onOpenCover: () => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          background: "#fff",
          height: "100%",
          overflowY: "auto",
          padding: 24,
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <strong style={{ fontSize: 18 }}>Parametres du contenu</strong>
          <button className="admin-btn admin-btn-sm" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="admin-field">
          <label className="admin-label">Titre</label>
          <input
            className="admin-input"
            value={meta.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        {kind === "article" ? (
          <div className="admin-field">
            <label className="admin-label">Slug (URL)</label>
            <input
              className="admin-input"
              placeholder="genere depuis le titre si vide"
              value={meta.slug || ""}
              onChange={(e) => onChange({ slug: e.target.value })}
            />
          </div>
        ) : (
          <>
            <div className="admin-field">
              <label className="admin-label">Chemin (URL)</label>
              <input
                className="admin-input"
                placeholder="/a-propos"
                value={meta.path || ""}
                disabled={meta.isHome || meta.path === ARTICLES_PAGE_PATH}
                onChange={(e) => onChange({ path: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label className="admin-row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!meta.isHome}
                  disabled={meta.path === ARTICLES_PAGE_PATH}
                  onChange={(e) => onChange({ isHome: e.target.checked })}
                />
                <span>Definir comme page d&apos;accueil</span>
              </label>
            </div>
            <div className="admin-field">
              <label className="admin-row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!meta.showInNav}
                  onChange={(e) => onChange({ showInNav: e.target.checked })}
                />
                <span>Afficher dans le menu (navbar)</span>
              </label>
            </div>
            <div className="admin-field">
              <label className="admin-label">Ordre dans le menu</label>
              <input
                className="admin-input"
                type="number"
                value={meta.navOrder ?? 0}
                onChange={(e) => onChange({ navOrder: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        {kind === "article" && (
          <>
            <div className="admin-field">
              <label className="admin-label">Extrait (resume)</label>
              <textarea
                className="admin-textarea"
                style={{ minHeight: 70, fontFamily: "inherit" }}
                value={meta.excerpt || ""}
                onChange={(e) => onChange({ excerpt: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Categorie</label>
              <select
                className="admin-select"
                value={meta.categoryId || ""}
                onChange={(e) =>
                  onChange({ categoryId: e.target.value || null })
                }
              >
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Image de couverture</label>
              {meta.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meta.coverUrl}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="admin-btn admin-btn-sm admin-btn-primary"
                  onClick={onOpenCover}
                >
                  Choisir
                </button>
                {meta.coverUrl && (
                  <button
                    className="admin-btn admin-btn-sm"
                    onClick={() =>
                      onChange({ coverMediaId: null, coverUrl: null })
                    }
                  >
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div className="admin-field">
          <label className="admin-label">Langue</label>
          <select
            className="admin-select"
            value={meta.locale}
            onChange={(e) => onChange({ locale: e.target.value })}
          >
            {locales.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
        <strong style={{ fontSize: 14 }}>SEO</strong>

        <div className="admin-field" style={{ marginTop: 12 }}>
          <label className="admin-label">Titre meta</label>
          <input
            className="admin-input"
            value={meta.metaTitle || ""}
            onChange={(e) => onChange({ metaTitle: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Description meta</label>
          <textarea
            className="admin-textarea"
            style={{ minHeight: 70, fontFamily: "inherit" }}
            value={meta.metaDescription || ""}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
