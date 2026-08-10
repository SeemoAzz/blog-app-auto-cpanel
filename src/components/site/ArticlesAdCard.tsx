"use client";

import type { CSSProperties } from "react";
import { AdSlot } from "@/components/AdSlot";
import type { ArticlesCardStyle, ArticlesLayout, ArticlesPageAdSlot } from "@/lib/articles-page-config";

type Props = {
  slot: ArticlesPageAdSlot;
  clientId?: string;
  cardStyle?: ArticlesCardStyle;
  layout?: ArticlesLayout;
  preview?: boolean;
};

function shellStyle(cardStyle: ArticlesCardStyle, layout: ArticlesLayout): CSSProperties {
  const isMinimal = cardStyle === "minimal";
  const isBordered = cardStyle === "bordered";
  const isAccent = cardStyle === "accent";
  const isList = layout === "list";

  return {
    background: isMinimal ? "transparent" : "var(--color-surface)",
    border: isMinimal
      ? "none"
      : `${isBordered ? 2 : 1}px solid ${isBordered ? "var(--color-primary)" : "var(--color-border)"}`,
    borderRadius: isMinimal ? 0 : "calc(var(--radius) + 4px)",
    overflow: "hidden",
    display: isList ? "flex" : "block",
    alignItems: isList ? "stretch" : undefined,
    borderLeft: isAccent && isList ? "4px solid var(--color-primary)" : undefined,
    borderTop: isAccent && !isList ? "4px solid var(--color-primary)" : undefined,
    height: isList ? undefined : "100%",
  };
}

export function ArticlesAdCard({
  slot,
  clientId,
  cardStyle = "classic",
  layout = "grid-3",
  preview = false,
}: Props) {
  const isList = layout === "list";

  if (isList) {
    return (
      <div className="articles-list-item" style={shellStyle(cardStyle, layout)}>
        <div
          style={{
            width: 200,
            flexShrink: 0,
            minHeight: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "color-mix(in srgb, var(--color-muted) 12%, transparent)",
            color: "var(--color-muted)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Pub
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: cardStyle === "minimal" ? "12px 16px" : 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AdSlot
            clientId={clientId}
            slotId={slot.slotId}
            format={slot.format}
            label={slot.label}
            preview={preview}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle(cardStyle, layout)}>
      <div
        style={{
          padding: cardStyle === "minimal" ? "12px 0" : 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: 200,
          height: "100%",
        }}
      >
        <AdSlot
          clientId={clientId}
          slotId={slot.slotId}
          format={slot.format}
          label={slot.label}
          preview={preview}
          compact
        />
      </div>
    </div>
  );
}
