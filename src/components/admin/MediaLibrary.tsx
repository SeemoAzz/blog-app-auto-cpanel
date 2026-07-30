"use client";

import { useState } from "react";
import { useMediaList, type MediaItem } from "@/components/MediaPicker";

export function MediaLibrary() {
  const { items, loading, refresh, setItems } = useMediaList();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || "Echec de l'upload");
        }
        const data = await res.json();
        setItems((prev) => [data.item, ...prev]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce media ?")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected(null);
  };

  const handleSaveAlt = async (item: MediaItem, alt: string) => {
    await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, alt } : i)));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(location.origin + url).catch(() => {});
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="admin-page-title">Mediatheque</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Tous tes fichiers, reutilisables dans n&apos;importe quel article ou page.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <label className="admin-btn admin-btn-primary" style={{ cursor: "pointer" }}>
            {uploading ? "Envoi..." : "Importer des images"}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
          <button className="admin-btn" onClick={() => refresh()}>
            Rafraichir
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-card" style={{ color: "#dc2626", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--admin-muted)" }}>Chargement...</p>
      ) : items.length === 0 ? (
        <div className="admin-card">
          <p style={{ color: "var(--admin-muted)" }}>
            Aucun media. Importe des images ou genere-les via le generateur IA.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="admin-card"
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt || item.filename}
                style={{ width: "100%", height: 130, objectFit: "cover", display: "block", cursor: "pointer" }}
                onClick={() => setSelected(item)}
              />
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--admin-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 8,
                  }}
                  title={item.filename}
                >
                  {item.source === "ai" ? "IA - " : ""}
                  {item.filename}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="admin-btn admin-btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => copyUrl(item.url)}
                  >
                    Copier URL
                  </button>
                  <button
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <MediaDetail
          item={selected}
          onClose={() => setSelected(null)}
          onSaveAlt={handleSaveAlt}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function MediaDetail({
  item,
  onClose,
  onSaveAlt,
  onDelete,
}: {
  item: MediaItem;
  onClose: () => void;
  onSaveAlt: (item: MediaItem, alt: string) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [alt, setAlt] = useState(item.alt || "");
  const [saving, setSaving] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "min(700px, 100%)",
          maxHeight: "88vh",
          overflow: "auto",
          padding: 20,
          color: "#111827",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.alt || item.filename}
          style={{ width: "100%", maxHeight: 360, objectFit: "contain", background: "#f3f4f6", borderRadius: 8 }}
        />
        <div style={{ marginTop: 14, fontSize: 13, color: "#6b7280" }}>
          {item.width && item.height ? `${item.width} x ${item.height} px - ` : ""}
          {item.mime}
        </div>
        <div className="admin-field" style={{ marginTop: 14 }}>
          <label className="admin-label">Texte alternatif (SEO / accessibilite)</label>
          <input
            className="admin-input"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
          <button className="admin-btn admin-btn-danger" onClick={() => onDelete(item.id)}>
            Supprimer
          </button>
          <button
            className="admin-btn admin-btn-primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSaveAlt(item, alt);
              setSaving(false);
              onClose();
            }}
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
