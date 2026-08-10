import "server-only";
import { generateText, generateImage } from "./openrouter";
import { saveMediaFromDataUrl, saveMediaFromUrl } from "@/lib/media";
import type { AiArticle, AiSection } from "./to-puck";

export type ContentBlock = {
  type: string;
  content?: string;
  url?: string;
  alt?: string;
};

export type RewriteArticleParams = {
  title: string;
  content?: string;
  contentBlocks?: ContentBlock[];
  sourceUrl?: string;
  author?: string;
  siteName?: string;
  language?: string;
  tone?: string;
  withHeroImage?: boolean;
  sectionImages?: boolean;
};

const LANG_NAMES: Record<string, string> = {
  fr: "francais",
  en: "anglais",
  es: "espagnol",
  ar: "arabe",
  de: "allemand",
  it: "italien",
  pt: "portugais",
};

type SavedImage = { url: string; alt: string };

function parseJson(raw: string): unknown {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    text = text.slice(first, last + 1);
  }
  return JSON.parse(text);
}

function blocksToPlainText(blocks: ContentBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === "text" && block.content) {
      parts.push(block.content);
    } else if (block.type === "image" && block.alt) {
      parts.push(`[Image: ${block.alt}]`);
    }
  }
  return parts.join("\n\n");
}

function extractSourceImages(blocks: ContentBlock[]): { url: string; alt: string }[] {
  const seen = new Set<string>();
  const images: { url: string; alt: string }[] = [];
  for (const block of blocks) {
    if (block.type !== "image" || !block.url?.trim()) continue;
    const url = block.url.trim();
    if (seen.has(url)) continue;
    seen.add(url);
    images.push({ url, alt: block.alt || "" });
  }
  return images;
}

async function saveImage(
  dataUrlOrUrl: string,
  prompt: string,
  alt: string,
  referer?: string,
): Promise<string | null> {
  try {
    const media = dataUrlOrUrl.startsWith("data:")
      ? await saveMediaFromDataUrl(dataUrlOrUrl, { source: "ai", prompt, alt })
      : await saveMediaFromUrl(dataUrlOrUrl, { source: "upload", alt, referer });
    return media.url;
  } catch (e) {
    console.error("[rewrite-article] saveImage failed:", dataUrlOrUrl, e);
    return null;
  }
}

/** Telecharge toutes les images source en parallele et retourne celles reussies. */
async function downloadSourceImages(
  images: { url: string; alt: string }[],
  referer?: string,
): Promise<SavedImage[]> {
  const results = await Promise.all(
    images.map(async (img) => {
      const localUrl = await saveImage(img.url, "source", img.alt || "", referer);
      return localUrl ? { url: localUrl, alt: img.alt || "" } : null;
    }),
  );
  return results.filter((r): r is SavedImage => r !== null);
}

function distributeImagesToSections(
  sections: { heading?: string; html?: string; imagePrompt?: string }[],
  downloaded: SavedImage[],
  useHero: boolean,
): {
  heroImage: string | null;
  sectionImages: (SavedImage | null)[];
  extraImages: SavedImage[];
} {
  if (downloaded.length === 0) {
    return { heroImage: null, sectionImages: sections.map(() => null), extraImages: [] };
  }

  const heroImage = useHero ? downloaded[0].url : null;
  const pool = useHero ? downloaded.slice(1) : downloaded;
  const sectionCount = sections.length;

  const sectionImages: (SavedImage | null)[] = sections.map((_, i) => {
    if (pool.length === 0) return null;
    if (pool.length >= sectionCount) {
      return pool[i] ?? null;
    }
    const idx = Math.floor((i * pool.length) / sectionCount);
    return pool[idx] ?? null;
  });

  const used = new Set(
    sectionImages.filter(Boolean).map((img) => img!.url),
  );
  const extraImages = pool.filter((img) => !used.has(img.url));

  return { heroImage, sectionImages, extraImages };
}

/** Reecrit un article source avec l'IA et prepare un brouillon editable. */
export async function rewriteArticleFromSource(
  params: RewriteArticleParams,
): Promise<AiArticle> {
  const lang = LANG_NAMES[params.language || "fr"] || "francais";
  const tone = params.tone || "informatif et engageant";

  const sourceText =
    params.contentBlocks?.length
      ? blocksToPlainText(params.contentBlocks)
      : params.content || "";

  if (!sourceText.trim() && !params.title.trim()) {
    throw new Error("Contenu source insuffisant pour la reecriture");
  }

  const contextParts: string[] = [];
  if (params.sourceUrl) contextParts.push(`URL source: ${params.sourceUrl}`);
  if (params.siteName) contextParts.push(`Site: ${params.siteName}`);
  if (params.author) contextParts.push(`Auteur original: ${params.author}`);

  const system = `Tu es un redacteur web SEO expert. Tu reecris des articles en ${lang}, sur un ton ${tone}, en produisant un contenu ORIGINAL et unique (pas de copier-coller). Tu reponds STRICTEMENT en JSON valide, sans texte autour.`;

  const prompt = `Reecris cet article pour mon blog. Garde les informations factuelles mais reformule entierement le texte.

Titre original: "${params.title}"
${contextParts.length ? contextParts.join("\n") + "\n" : ""}
Contenu source:
"""
${sourceText.slice(0, 12000)}
"""

Structure la reponse en JSON avec exactement ce format:
{
  "title": "nouveau titre accrocheur",
  "excerpt": "resume en 1-2 phrases",
  "metaTitle": "titre SEO (max 60 caracteres)",
  "metaDescription": "description SEO (max 155 caracteres)",
  "heroImagePrompt": "description en anglais d'une image d'illustration principale (ou chaine vide)",
  "sections": [
    { "heading": "titre de section", "html": "<p>contenu en HTML avec p, ul, li, strong...</p>", "imagePrompt": "description en anglais d'une image pour cette section (ou chaine vide)" }
  ]
}
Contraintes: 3 a 6 sections. HTML sans <html>/<body>. Contenu informatif, pas de remplissage.`;

  const raw = await generateText({ prompt, system, json: true, maxTokens: 6000 });
  const parsed = parseJson(raw) as {
    title?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    heroImagePrompt?: string;
    sections?: { heading?: string; html?: string; imagePrompt?: string }[];
  };

  const title = parsed.title || params.title;
  const excerpt = parsed.excerpt || "";
  const sections = parsed.sections || [];
  const imageReferer = params.sourceUrl;

  let heroImage: string | null = null;
  let extraImages: SavedImage[] = [];
  let sectionImageMap: (SavedImage | null)[] = sections.map(() => null);

  if (params.withHeroImage && parsed.heroImagePrompt) {
    try {
      const img = await generateImage({ prompt: parsed.heroImagePrompt, aspectRatio: "16:9" });
      heroImage = await saveImage(img, parsed.heroImagePrompt, title);
    } catch {
      heroImage = null;
    }
  }

  const sourceImages = params.contentBlocks?.length
    ? extractSourceImages(params.contentBlocks)
    : [];

  if (sourceImages.length > 0 && !params.sectionImages) {
    const downloaded = await downloadSourceImages(sourceImages, imageReferer);
    const useHeroFromSource = !heroImage;
    const distributed = distributeImagesToSections(sections, downloaded, useHeroFromSource);
    if (!heroImage) heroImage = distributed.heroImage;
    sectionImageMap = distributed.sectionImages;
    extraImages = distributed.extraImages;
  }

  const outSections: AiSection[] = [];

  for (let i = 0; i < sections.length; i += 1) {
    const s = sections[i];
    let image: AiSection["image"] = null;

    if (params.sectionImages && s.imagePrompt) {
      try {
        const img = await generateImage({ prompt: s.imagePrompt, aspectRatio: "16:9" });
        const url = await saveImage(img, s.imagePrompt, s.heading || title);
        if (url) image = { url, alt: s.heading || title };
      } catch {
        image = null;
      }
    } else if (sectionImageMap[i]) {
      const src = sectionImageMap[i]!;
      image = { url: src.url, alt: src.alt || s.heading || title };
    }

    outSections.push({
      id: `sec-${i + 1}`,
      heading: s.heading || `Section ${i + 1}`,
      html: s.html || "",
      image,
      imagePrompt: s.imagePrompt || "",
    });
  }

  return {
    title,
    excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    heroImage,
    heroImagePrompt: parsed.heroImagePrompt || "",
    sections: outSections,
    extraImages,
  };
}
