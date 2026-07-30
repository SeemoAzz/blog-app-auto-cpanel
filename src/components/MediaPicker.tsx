"use client";

import { useCallback, useEffect, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  alt: string | null;
  mime: string;
  width: number | null;
  height: number | null;
  source: string;
  createdAt: string;
};

export function useMediaList() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/media", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh, setItems };
}

export async function uploadMediaFile(file: File): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/media", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Echec de l'upload");
  }
  const data = await res.json();
  return data.item as MediaItem;
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  const { items, loading, refresh, setItems } = useMediaList();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!open) return null;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const item = await uploadMediaFile(file);
        setItems((prev) => [item, ...prev]);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setUploading(false);
    }
  };

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
          width: "min(900px, 100%)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          color: "#111827",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>Mediatheque</strong>
          <div style={{ display: "flex", gap: 8 }}>
            <label
              className="admin-btn admin-btn-sm admin-btn-primary"
              style={{ cursor: "pointer" }}
            >
              {uploading ? "Envoi..." : "Importer"}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
            <button className="admin-btn admin-btn-sm" onClick={() => refresh()}>
              Rafraichir
            </button>
            <button className="admin-btn admin-btn-sm" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>

        {uploadError && (
          <div style={{ color: "#dc2626", fontSize: 13, padding: "8px 18px" }}>
            {uploadError}
          </div>
        )}

        <div style={{ padding: 18, overflowY: "auto" }}>
          {loading ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : items.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              Aucun media. Clique sur &laquo; Importer &raquo; pour ajouter une image.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#fff",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    style={{
                      width: "100%",
                      height: 110,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      padding: "6px 8px",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
