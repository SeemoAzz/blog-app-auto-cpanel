"use client";

import { AdSlot } from "@/components/AdSlot";

type Props = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  slotId: string;
  format: string;
  label: string;
};

export function AdInterstitial({ open, onClose, clientId, slotId, format, label }: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Publicite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-bg)",
          borderRadius: "calc(var(--radius) + 6px)",
          maxWidth: 560,
          width: "100%",
          padding: "28px 24px 24px",
          position: "relative",
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la publicite"
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            border: "none",
            background: "transparent",
            fontSize: 28,
            lineHeight: 1,
            cursor: "pointer",
            color: "var(--color-muted)",
            padding: 4,
          }}
        >
          ×
        </button>

        <p
          style={{
            textAlign: "center",
            color: "var(--color-muted)",
            fontSize: 13,
            margin: "0 0 16px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Publicite
        </p>

        <AdSlot clientId={clientId} slotId={slotId} format={format} label={label} />

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "14px 20px",
            border: "none",
            borderRadius: "var(--radius)",
            background: "var(--color-primary)",
            color: "var(--color-primary-contrast)",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Continuer la lecture
        </button>
      </div>
    </div>
  );
}
