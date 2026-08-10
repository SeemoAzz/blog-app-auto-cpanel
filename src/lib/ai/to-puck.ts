import type { Data } from "@puckeditor/core";

export type AiSection = {
  id: string;
  heading: string;
  html: string;
  image?: { url: string; alt: string } | null;
  imagePrompt?: string;
};

export type AiArticle = {
  title: string;
  excerpt: string;
  metaTitle?: string;
  metaDescription?: string;
  heroImage?: string | null;
  heroImagePrompt?: string;
  sections: AiSection[];
  /** Images source non placees dans une section (ajoutees en fin d'article). */
  extraImages?: { url: string; alt: string }[];
};

let counter = 0;
function uid(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

type Block = { type: string; props: Record<string, unknown> };

/** Convertit un article genere par l'IA en donnees Puck editables. */
export function articleToPuckData(
  article: AiArticle,
  opts: { includeAds?: boolean } = { includeAds: true },
): Data {
  const content: Block[] = [];

  // Banniere hero avec titre + extrait (+ image si dispo)
  content.push({
    type: "Hero",
    props: {
      id: uid("Hero"),
      variantId: article.heroImage ? "hero-imagetop" : "hero-minimal",
      title: article.title,
      subtitle: article.excerpt,
      buttonLabel: "",
      buttonHref: "",
      media: article.heroImage || "",
    },
  });

  article.sections.forEach((section, index) => {
    content.push({
      type: "Heading",
      props: { id: uid("Heading"), text: section.heading, level: "h2", align: "left" },
    });
    content.push({
      type: "RichText",
      props: { id: uid("RichText"), html: section.html, align: "left", maxWidth: "prose" },
    });
    if (section.image?.url) {
      content.push({
        type: "Image",
        props: {
          id: uid("Image"),
          media: section.image.url,
          alt: section.image.alt || section.heading,
          caption: "",
          width: "860px",
          rounded: "var(--radius)",
          align: "center",
        },
      });
    }
    // Emplacement publicitaire apres la 1ere et au milieu
    if (
      opts.includeAds &&
      (index === 0 || index === Math.floor(article.sections.length / 2))
    ) {
      content.push({
        type: "AdSlot",
        props: { id: uid("AdSlot"), format: "auto", slotId: "", label: "Publicite" },
      });
    }
  });

  for (const img of article.extraImages ?? []) {
    content.push({
      type: "Image",
      props: {
        id: uid("Image"),
        media: img.url,
        alt: img.alt || "",
        caption: "",
        width: "860px",
        rounded: "var(--radius)",
        align: "center",
      },
    });
  }

  return {
    root: { props: { title: article.title } },
    content,
    zones: {},
  } as Data;
}
