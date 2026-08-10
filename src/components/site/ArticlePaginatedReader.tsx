"use client";

import { Children, useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { PartBreakConfig } from "@/lib/article-parts";
import { AdInterstitial } from "@/components/site/AdInterstitial";

type Props = {
  breaks: PartBreakConfig[];
  adsenseClientId: string;
  totalParts: number;
  children: ReactNode;
};

const navWrapStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "0 20px",
};

const btnBase: CSSProperties = {
  padding: "12px 24px",
  borderRadius: "var(--radius)",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  minWidth: 160,
};

const btnPrimary: CSSProperties = {
  ...btnBase,
  border: "none",
  background: "var(--color-primary)",
  color: "var(--color-primary-contrast)",
};

const btnSecondary: CSSProperties = {
  ...btnBase,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
};

function PartNavBottom({
  partIndex,
  totalParts,
  prevLabel,
  nextLabel,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  partIndex: number;
  totalParts: number;
  prevLabel: string;
  nextLabel: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <footer
      className="article-part-nav-bottom"
      style={{
        ...navWrapStyle,
        marginTop: 40,
        marginBottom: 48,
        paddingTop: 28,
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "var(--color-muted)",
          fontWeight: 600,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Partie {partIndex + 1} / {totalParts}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {hasPrev && (
          <button type="button" onClick={onPrev} style={btnSecondary}>
            ← {prevLabel}
          </button>
        )}
        {hasNext && (
          <button type="button" onClick={onNext} style={btnPrimary}>
            {nextLabel} →
          </button>
        )}
      </div>
    </footer>
  );
}

export function ArticlePaginatedReader({
  breaks,
  adsenseClientId,
  totalParts,
  children,
}: Props) {
  const parts = Children.toArray(children);
  const [partIndex, setPartIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const breakConfig = breaks[partIndex];
  const prevBreakConfig = partIndex > 0 ? breaks[partIndex - 1] : null;
  const hasNext = partIndex < parts.length - 1;
  const hasPrev = partIndex > 0;

  const prevLabel = prevBreakConfig?.prevButtonLabel || "Partie precedente";
  const nextLabel = breakConfig?.nextButtonLabel || "Partie suivante";

  const scrollToArticle = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToNextPart = useCallback(() => {
    setPartIndex((i) => i + 1);
    scrollToArticle();
  }, [scrollToArticle]);

  const goToPrevPart = useCallback(() => {
    setPartIndex((i) => Math.max(0, i - 1));
    scrollToArticle();
  }, [scrollToArticle]);

  const handleNext = () => {
    if (!hasNext) return;
    if (breakConfig?.showAdBeforeNext) {
      setShowAd(true);
    } else {
      goToNextPart();
    }
  };

  const closeAd = () => {
    setShowAd(false);
    goToNextPart();
  };

  return (
    <div className="article-paginated-reader">
      <div key={partIndex} className="article-part-content">
        {parts[partIndex]}
      </div>

      {mounted && totalParts > 1 && (
        <PartNavBottom
          partIndex={partIndex}
          totalParts={totalParts}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={goToPrevPart}
          onNext={handleNext}
        />
      )}

      <AdInterstitial
        open={showAd}
        onClose={closeAd}
        clientId={adsenseClientId}
        slotId={breakConfig?.adSlotId || ""}
        format={breakConfig?.adFormat || "rectangle"}
        label={breakConfig?.adLabel || "Publicite"}
      />
    </div>
  );
}
