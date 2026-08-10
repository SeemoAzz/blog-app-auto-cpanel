import type { Data } from "@puckeditor/core";

export type PartBreakConfig = {
  nextButtonLabel: string;
  prevButtonLabel: string;
  showAdBeforeNext: boolean;
  adFormat: string;
  adSlotId: string;
  adLabel: string;
};

const DEFAULT_BREAK: PartBreakConfig = {
  nextButtonLabel: "Partie suivante",
  prevButtonLabel: "Partie precedente",
  showAdBeforeNext: true,
  adFormat: "rectangle",
  adSlotId: "",
  adLabel: "Publicite",
};

function breakFromProps(props: Record<string, unknown> | undefined): PartBreakConfig {
  const adFlag = props?.showAdBeforeNext;
  const showAd =
    adFlag !== false && adFlag !== "no" && adFlag !== 0 && adFlag !== "false";
  return {
    nextButtonLabel: String(props?.nextButtonLabel || DEFAULT_BREAK.nextButtonLabel),
    prevButtonLabel: String(props?.prevButtonLabel || DEFAULT_BREAK.prevButtonLabel),
    showAdBeforeNext: showAd,
    adFormat: String(props?.adFormat || DEFAULT_BREAK.adFormat),
    adSlotId: String(props?.adSlotId || ""),
    adLabel: String(props?.adLabel || DEFAULT_BREAK.adLabel),
  };
}

function fallbackData(): Data {
  return { root: { props: {} }, content: [], zones: {} } as Data;
}

/** Decoupe le contenu Puck d'un article aux blocs ArticlePartBreak. */
export function splitArticleByParts(puckDataJson: string): {
  parts: Data[];
  breaks: PartBreakConfig[];
} {
  let data: Data;
  try {
    data = JSON.parse(puckDataJson) as Data;
  } catch {
    return { parts: [fallbackData()], breaks: [] };
  }

  if (!Array.isArray(data.content) || data.content.length === 0) {
    return { parts: [data], breaks: [] };
  }

  const hasBreak = data.content.some((b) => b.type === "ArticlePartBreak");
  if (!hasBreak) {
    return { parts: [data], breaks: [] };
  }

  const parts: Data[] = [];
  const breaks: PartBreakConfig[] = [];
  let current: Data["content"] = [];

  for (const block of data.content) {
    if (block.type === "ArticlePartBreak") {
      if (current.length > 0) {
        parts.push({ ...data, content: [...current] });
        breaks.push(breakFromProps(block.props as Record<string, unknown>));
        current = [];
      }
    } else {
      current.push(block);
    }
  }

  if (current.length > 0) {
    parts.push({ ...data, content: current });
  }

  if (parts.length <= 1) {
    return { parts: [data], breaks: [] };
  }

  return { parts, breaks: breaks.slice(0, parts.length - 1) };
}
