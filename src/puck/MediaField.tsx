"use client";

import { useState } from "react";
import { MediaPickerModal } from "@/components/MediaPicker";

/**
 * Champ Puck personnalise pour selectionner une image depuis la mediatheque
 * ou coller une URL. La valeur stockee est une URL (string).
 */
export function MediaField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {value ? (
        <div
          style={{
            position: "relative",
            border: "1px solid var(--admin-border, #e5e7eb)",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }}
          />
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <button
          type="button"
          className="admin-btn admin-btn-sm admin-btn-primary"
          onClick={() => setOpen(true)}
        >
          Choisir une image
        </button>
        {value && (
          <button
            type="button"
            className="admin-btn admin-btn-sm"
            onClick={() => onChange("")}
          >
            Retirer
          </button>
        )}
      </div>

      <input
        className="admin-input"
        style={{ fontSize: 12 }}
        placeholder="ou colle une URL d'image"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />

      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(item) => onChange(item.url)}
      />
    </div>
  );
}
