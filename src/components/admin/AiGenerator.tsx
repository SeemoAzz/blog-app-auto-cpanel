"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { articleToPuckData, type AiArticle } from "@/lib/ai/to-puck";
import { saveArticle } from "@/app/admin/content-actions";
import {
  MediaPickerModal,
  uploadMediaFile,
  type MediaItem,
} from "@/components/MediaPicker";

const LANGS = [
  { value: "fr", label: "Francais" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "ar", label: "Arabe" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
  { value: "pt", label: "Portugais" },
];

const TONES = [
  "informatif et engageant",
  "professionnel",
  "amical et decontracte",
  "expert / technique",
  "persuasif (marketing)",
  "journalistique",
];

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur");
  return data;
}

type ImageTarget = "hero" | number;

function ImageActions({
  target,
  hasImage,
  busy,
  uploading,
  onGenerate,
  onPick,
  onImport,
  onRemove,
  generateLabel,
}: {
  target: ImageTarget;
  hasImage: boolean;
  busy: string | null;
  uploading: string | null;
  onGenerate: () => void;
  onPick: () => void;
  onImport: (file: File) => void;
  onRemove?: () => void;
  generateLabel: string;
}) {
  const genKey = target === "hero" ? "img-hero" : `img-${target}`;
  const upKey = target === "hero" ? "upload-hero" : `upload-${target}`;
  const isGenerating = busy === genKey;
  const isUploading = uploading === upKey;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <button
        className="admin-btn admin-btn-sm"
        onClick={onGenerate}
        disabled={isGenerating || isUploading}
      >
        {isGenerating ? "Generation..." : generateLabel}
      </button>
      <button
        className="admin-btn admin-btn-sm"
        onClick={onPick}
        disabled={isGenerating || isUploading}
      >
        Mediatheque
      </button>
      <label
        className="admin-btn admin-btn-sm"
        style={{ cursor: isUploading ? "wait" : "pointer" }}
      >
        {isUploading ? "Import..." : "Importer"}
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={isGenerating || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = "";
          }}
        />
      </label>
      {hasImage && onRemove && (
        <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={onRemove}>
          Retirer
        </button>
      )}
    </div>
  );
}

export function AiGenerator({
  aiConfigured,
  categories,
}: {
  aiConfigured: boolean;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [creating, startCreate] = useTransition();

  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("fr");
  const [tone, setTone] = useState(TONES[0]);
  const [sectionsCount, setSectionsCount] = useState(4);
  const [withHeroImage, setWithHeroImage] = useState(true);
  const [sectionImages, setSectionImages] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [manualHeroImage, setManualHeroImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [mediaPickerFor, setMediaPickerFor] = useState<ImageTarget | "form-hero" | null>(null);
  const [article, setArticle] = useState<AiArticle | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setArticle(null);
    try {
      const data = await post("/api/ai/generate-article", {
        topic,
        language,
        tone,
        sectionsCount,
        withHeroImage: withHeroImage && !manualHeroImage,
        sectionImages,
      });
      const generated = data.article as AiArticle;
      if (manualHeroImage) {
        generated.heroImage = manualHeroImage;
      }
      setArticle(generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const regenSection = async (index: number) => {
    if (!article) return;
    setBusy(`sec-${index}`);
    setError(null);
    try {
      const data = await post("/api/ai/regenerate-section", {
        topic,
        language,
        tone,
        heading: article.sections[index].heading,
      });
      const sections = [...article.sections];
      sections[index] = { ...sections[index], html: data.html, heading: data.heading };
      setArticle({ ...article, sections });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const regenImage = async (target: "hero" | number) => {
    if (!article) return;
    const prompt =
      target === "hero"
        ? article.heroImagePrompt || article.title
        : article.sections[target].imagePrompt ||
          article.sections[target].heading;
    setBusy(target === "hero" ? "img-hero" : `img-${target}`);
    setError(null);
    try {
      const data = await post("/api/ai/regenerate-image", { prompt });
      if (target === "hero") {
        setArticle({ ...article, heroImage: data.url });
      } else {
        const sections = [...article.sections];
        sections[target] = {
          ...sections[target],
          image: { url: data.url, alt: sections[target].heading },
        };
        setArticle({ ...article, sections });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const createArticle = () => {
    if (!article) return;
    startCreate(async () => {
      const data = articleToPuckData(article);
      const res = await saveArticle({
        title: article.title,
        excerpt: article.excerpt,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        status: "draft",
        categoryId: categoryId || null,
        ogImage: article.heroImage || undefined,
        data,
      });
      router.push(`/admin/articles/${res.id}`);
    });
  };

  const applyMedia = (target: ImageTarget, item: MediaItem) => {
    if (!article) return;
    if (target === "hero") {
      setArticle({ ...article, heroImage: item.url });
    } else {
      const sections = [...article.sections];
      sections[target] = {
        ...sections[target],
        image: { url: item.url, alt: item.alt || sections[target].heading },
      };
      setArticle({ ...article, sections });
    }
  };

  const importImageFile = async (target: ImageTarget | "form-hero", file: File) => {
    const upKey =
      target === "form-hero" ? "upload-form-hero" : target === "hero" ? "upload-hero" : `upload-${target}`;
    setUploadingImage(upKey);
    setError(null);
    try {
      const item = await uploadMediaFile(file);
      if (target === "form-hero") {
        setManualHeroImage(item.url);
      } else if (article) {
        applyMedia(target, item);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleMediaPick = (item: MediaItem) => {
    if (mediaPickerFor === "form-hero") {
      setManualHeroImage(item.url);
    } else if (mediaPickerFor !== null && article) {
      applyMedia(mediaPickerFor, item);
    }
    setMediaPickerFor(null);
  };

  const removeHeroImage = (scope: "form" | "preview") => {
    if (scope === "form") {
      setManualHeroImage(null);
    } else if (article) {
      setArticle({ ...article, heroImage: null });
    }
  };

  const removeSectionImage = (index: number) => {
    if (!article) return;
    const sections = [...article.sections];
    sections[index] = { ...sections[index], image: null };
    setArticle({ ...article, sections });
  };
  const patchSection = (index: number, patch: Partial<AiArticle["sections"][number]>) => {
    if (!article) return;
    const sections = [...article.sections];
    sections[index] = { ...sections[index], ...patch };
    setArticle({ ...article, sections });
  };

  return (
    <div>
      <h1 className="admin-page-title">Generateur d&apos;articles IA</h1>
      <p className="admin-page-sub">
        Genere un article complet (texte + images) avec OpenRouter, puis regenere
        chaque partie, importe tes propres images ou modifie tout manuellement
        avant de creer l&apos;article.
      </p>

      {!aiConfigured && (
        <div className="admin-card" style={{ borderColor: "#f59e0b", marginBottom: 16 }}>
          <strong>IA non configuree.</strong> Ajoute ta cle OpenRouter dans{" "}
          <a href="/admin/reglages">Reglages</a> pour activer la generation. La
          creation manuelle reste disponible dans les Articles.
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-field">
          <label className="admin-label">Sujet de l&apos;article</label>
          <input
            className="admin-input"
            placeholder="Ex: Les meilleures astuces pour economiser l'energie a la maison"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div className="admin-field">
            <label className="admin-label">Langue</label>
            <select className="admin-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Ton</label>
            <select className="admin-select" value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Nombre de sections</label>
            <input className="admin-input" type="number" min={1} max={8} value={sectionsCount} onChange={(e) => setSectionsCount(Number(e.target.value))} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
          <label className="admin-row" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={withHeroImage}
              disabled={Boolean(manualHeroImage)}
              onChange={(e) => setWithHeroImage(e.target.checked)}
            />
            <span>Generer une image principale (IA)</span>
          </label>
          <label className="admin-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={sectionImages} onChange={(e) => setSectionImages(e.target.checked)} />
            <span>Generer une image par section</span>
          </label>
          <div style={{ minWidth: 200 }}>
            <select className="admin-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sans categorie</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Image principale manuelle (optionnelle)</label>
          {manualHeroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={manualHeroImage}
              alt=""
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
            />
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="admin-btn admin-btn-sm"
              onClick={() => setMediaPickerFor("form-hero")}
              disabled={uploadingImage === "upload-form-hero"}
            >
              Mediatheque
            </button>
            <label
              className="admin-btn admin-btn-sm"
              style={{ cursor: uploadingImage === "upload-form-hero" ? "wait" : "pointer" }}
            >
              {uploadingImage === "upload-form-hero" ? "Import..." : "Importer"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploadingImage === "upload-form-hero"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importImageFile("form-hero", file);
                  e.target.value = "";
                }}
              />
            </label>
            {manualHeroImage && (
              <button
                className="admin-btn admin-btn-sm admin-btn-danger"
                onClick={() => removeHeroImage("form")}
              >
                Retirer
              </button>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
            Si une image est choisie ici, l&apos;IA ne generera pas d&apos;image principale.
          </p>
        </div>

        <button
          className="admin-btn admin-btn-primary"
          onClick={generate}
          disabled={loading || !aiConfigured || !topic.trim()}
        >
          {loading ? "Generation en cours (cela peut prendre 30-60s)..." : "Generer l'article"}
        </button>
      </div>

      {error && (
        <div className="admin-card" style={{ color: "#dc2626", marginBottom: 16 }}>{error}</div>
      )}

      {article && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700 }}>Apercu (modifiable)</h2>
            <button className="admin-btn admin-btn-primary" onClick={createArticle} disabled={creating}>
              {creating ? "Creation..." : "Creer l'article (brouillon)"}
            </button>
          </div>

          <div className="admin-field">
            <label className="admin-label">Titre</label>
            <input className="admin-input" value={article.title} onChange={(e) => setArticle({ ...article, title: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Extrait</label>
            <textarea className="admin-textarea" style={{ minHeight: 60, fontFamily: "inherit" }} value={article.excerpt} onChange={(e) => setArticle({ ...article, excerpt: e.target.value })} />
          </div>

          <div className="admin-field">
            <label className="admin-label">Image principale</label>
            {article.heroImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.heroImage} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
            )}
            <ImageActions
              target="hero"
              hasImage={Boolean(article.heroImage)}
              busy={busy}
              uploading={uploadingImage}
              onGenerate={() => regenImage("hero")}
              onPick={() => setMediaPickerFor("hero")}
              onImport={(file) => importImageFile("hero", file)}
              onRemove={() => removeHeroImage("preview")}
              generateLabel={article.heroImage ? "Regenerer (IA)" : "Generer (IA)"}
            />
          </div>

          <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid var(--admin-border)" }} />

          {article.sections.map((s, i) => (
            <div key={s.id} className="admin-card" style={{ marginBottom: 14, background: "var(--admin-bg)" }}>
              <div className="admin-field">
                <label className="admin-label">Titre de section {i + 1}</label>
                <input className="admin-input" value={s.heading} onChange={(e) => patchSection(i, { heading: e.target.value })} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Contenu (HTML)</label>
                <textarea className="admin-textarea" style={{ minHeight: 120 }} value={s.html} onChange={(e) => patchSection(i, { html: e.target.value })} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Image de section</label>
                {s.image?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image.url} alt={s.image.alt} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                )}
                <ImageActions
                  target={i}
                  hasImage={Boolean(s.image?.url)}
                  busy={busy}
                  uploading={uploadingImage}
                  onGenerate={() => regenImage(i)}
                  onPick={() => setMediaPickerFor(i)}
                  onImport={(file) => importImageFile(i, file)}
                  onRemove={() => removeSectionImage(i)}
                  generateLabel={s.image?.url ? "Regenerer (IA)" : "Generer (IA)"}
                />
              </div>
              <button className="admin-btn admin-btn-sm" onClick={() => regenSection(i)} disabled={busy === `sec-${i}`}>
                {busy === `sec-${i}` ? "..." : "Regenerer le texte"}
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaPickerModal
        open={mediaPickerFor !== null}
        onClose={() => setMediaPickerFor(null)}
        onSelect={handleMediaPick}
      />
    </div>
  );
}
