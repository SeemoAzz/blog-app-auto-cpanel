import "server-only";
import { generateText, generateImage } from "./openrouter";
import { saveMediaFromDataUrl, saveMediaFromUrl } from "@/lib/media";
import type { AiArticle, AiSection } from "./to-puck";

function parseJson(raw: string): unknown {
  let text = raw.trim();
  // retire d'eventuels blocs de code markdown
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    text = text.slice(first, last + 1);
  }
  return JSON.parse(text);
}

const LANG_NAMES: Record<string, string> = {
  fr: "francais",
  en: "anglais",
  es: "espagnol",
  ar: "arabe",
  de: "allemand",
  it: "italien",
  pt: "portugais",
};

async function saveImage(dataUrlOrUrl: string, prompt: string, alt: string) {
  try {
    const media = dataUrlOrUrl.startsWith("data:")
      ? await saveMediaFromDataUrl(dataUrlOrUrl, { source: "ai", prompt, alt })
      : await saveMediaFromUrl(dataUrlOrUrl, { source: "ai", prompt, alt });
    return media.url;
  } catch {
    return null;
  }
}

export type GenerateArticleParams = {
  topic: string;
  language?: string;
  tone?: string;
  sectionsCount?: number;
  withHeroImage?: boolean;
  sectionImages?: boolean;
  includeAds?: boolean;
};

/** Genere un brouillon d'article complet (texte + images sauvegardees en mediatheque). */
export async function generateArticleDraft(
  params: GenerateArticleParams,
): Promise<AiArticle> {
  const lang = LANG_NAMES[params.language || "fr"] || "francais";
  const tone = params.tone || "informatif et engageant";
  const sections = Math.min(Math.max(params.sectionsCount ?? 4, 1), 8);

  const system = `Tu es un redacteur web SEO expert. Tu ecris des articles de blog originaux, structures et de qualite, en ${lang}, sur un ton ${tone}. Tu reponds STRICTEMENT en JSON valide, sans texte autour.`;

  const prompt = `Redige un article de blog complet sur le sujet: "${params.topic}".
Structure la reponse en JSON avec exactement ce format:
{
  "title": "titre accrocheur",
  "excerpt": "resume en 1-2 phrases",
  "metaTitle": "titre SEO (max 60 caracteres)",
  "metaDescription": "description SEO (max 155 caracteres)",
  "heroImagePrompt": "description en anglais d'une image d'illustration principale",
  "sections": [
    { "heading": "titre de section", "html": "<p>contenu en HTML avec des balises p, ul, li, strong...</p>", "imagePrompt": "description en anglais d'une image pour cette section (ou chaine vide)" }
  ]
}
Contraintes: ${sections} sections. Le HTML ne doit contenir que le corps (pas de <html>/<body>). Contenu original, informatif, pas de remplissage.`;

  const raw = await generateText({ prompt, system, json: true, maxTokens: 5000 });
  const parsed = parseJson(raw) as {
    title?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    heroImagePrompt?: string;
    sections?: { heading?: string; html?: string; imagePrompt?: string }[];
  };

  const title = parsed.title || params.topic;
  const excerpt = parsed.excerpt || "";

  // Image hero
  let heroImage: string | null = null;
  if (params.withHeroImage && parsed.heroImagePrompt) {
    try {
      const img = await generateImage({ prompt: parsed.heroImagePrompt, aspectRatio: "16:9" });
      heroImage = await saveImage(img, parsed.heroImagePrompt, title);
    } catch {
      heroImage = null;
    }
  }

  // Sections (+ images optionnelles)
  const outSections: AiSection[] = [];
  let idx = 0;
  for (const s of parsed.sections || []) {
    idx += 1;
    let image: AiSection["image"] = null;
    if (params.sectionImages && s.imagePrompt) {
      try {
        const img = await generateImage({ prompt: s.imagePrompt, aspectRatio: "16:9" });
        const url = await saveImage(img, s.imagePrompt, s.heading || title);
        if (url) image = { url, alt: s.heading || title };
      } catch {
        image = null;
      }
    }
    outSections.push({
      id: `sec-${idx}`,
      heading: s.heading || `Section ${idx}`,
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
  };
}

/** Regenere le texte d'une section. */
export async function regenerateSection(params: {
  topic: string;
  language?: string;
  tone?: string;
  heading: string;
  instruction?: string;
}): Promise<{ heading: string; html: string }> {
  const lang = LANG_NAMES[params.language || "fr"] || "francais";
  const system = `Tu es un redacteur web SEO. Tu ecris en ${lang}. Reponds STRICTEMENT en JSON.`;
  const prompt = `Pour un article sur "${params.topic}", (re)ecris la section intitulee "${params.heading}".
${params.instruction ? `Consigne supplementaire: ${params.instruction}.` : ""}
Reponds en JSON: { "heading": "...", "html": "<p>...</p>" }. Le HTML ne contient que le corps.`;

  const raw = await generateText({ prompt, system, json: true, maxTokens: 1500 });
  const parsed = parseJson(raw) as { heading?: string; html?: string };
  return {
    heading: parsed.heading || params.heading,
    html: parsed.html || "",
  };
}

/** Regenere une image a partir d'un prompt et la sauvegarde en mediatheque. */
export async function regenerateImageAsset(params: {
  prompt: string;
  aspectRatio?: string;
  alt?: string;
}): Promise<{ url: string }> {
  const img = await generateImage({
    prompt: params.prompt,
    aspectRatio: params.aspectRatio || "16:9",
  });
  const url = await saveImage(img, params.prompt, params.alt || params.prompt);
  if (!url) throw new Error("Echec de l'enregistrement de l'image generee");
  return { url };
}
