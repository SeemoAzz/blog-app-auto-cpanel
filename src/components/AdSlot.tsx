"use client";

import { useEffect, useRef } from "react";

type Props = {
  clientId?: string;
  slotId?: string;
  format?: string;
  label?: string;
  /** true dans l'editeur Puck: on montre un apercu, pas de vraie pub */
  preview?: boolean;
  /** Sans marge externe — pour integration dans une carte article */
  compact?: boolean;
};

const FORMAT_SIZES: Record<string, { minHeight: number }> = {
  auto: { minHeight: 120 },
  horizontal: { minHeight: 90 },
  rectangle: { minHeight: 250 },
  vertical: { minHeight: 600 },
};

export function AdSlot({
  clientId,
  slotId,
  format = "auto",
  label = "Publicite",
  preview = false,
  compact = false,
}: Props) {
  const ref = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  const configured = Boolean(clientId && slotId);

  useEffect(() => {
    if (preview || !configured || pushed.current) return;
    try {
      // @ts-expect-error adsbygoogle injecte par le script AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ignore
    }
  }, [preview, configured]);

  const size = FORMAT_SIZES[format] ?? FORMAT_SIZES.auto;
  const outerMargin = compact ? 0 : "16px 0";

  // Apercu (editeur) ou pub non configuree: placeholder visuel
  if (preview || !configured) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: size.minHeight,
          width: compact ? "100%" : undefined,
          border: "1px dashed var(--color-border, #cbd5e1)",
          borderRadius: "var(--radius, 8px)",
          color: "var(--color-muted, #94a3b8)",
          background: "color-mix(in srgb, currentColor 4%, transparent)",
          fontSize: 13,
          margin: outerMargin,
          textAlign: "center",
          padding: 12,
        }}
      >
        {configured
          ? `Emplacement publicitaire (${format})`
          : `Emplacement publicitaire (${format}) - a configurer dans Reglages`}
      </div>
    );
  }

  return (
    <div style={{ margin: outerMargin, textAlign: "center", width: compact ? "100%" : undefined }}>
      {label && (
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-muted)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block", minHeight: size.minHeight }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format === "auto" ? "auto" : undefined}
        data-full-width-responsive="true"
      />
    </div>
  );
}
