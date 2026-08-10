import "server-only";
import { getSetting } from "@/lib/settings";

const BASE = "https://openrouter.ai/api/v1";

async function getApiKey(): Promise<string | undefined> {
  const envKey = process.env.OPENROUTER_API_KEY?.trim();
  if (envKey) return envKey;

  const ai = await getSetting("ai");
  const dbKey = ai.apiKey?.trim();
  return dbKey || undefined;
}

export async function isAiConfigured(): Promise<boolean> {
  return Boolean(await getApiKey());
}

/** Verifie que la cle OpenRouter fonctionne vraiment (pas seulement presente). */
export async function verifyOpenRouterConnection(): Promise<boolean> {
  const key = await getApiKey();
  if (!key) return false;

  try {
    const res = await fetch(`${BASE}/models`, {
      method: "GET",
      headers: buildOpenRouterHeaders(key),
      signal: AbortSignal.timeout(15_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function buildOpenRouterHeaders(key: string): Headers {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  headers.set(
    "HTTP-Referer",
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  );
  headers.set("Referer", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  headers.set("X-Title", "Blog AdSense Builder");
  return headers;
}

async function openRouterHeaders(): Promise<Headers> {
  const key = await getApiKey();
  if (!key) {
    throw new Error(
      "OpenRouter non configure. Ajoute ta cle API dans Admin > Reglages ou la variable OPENROUTER_API_KEY sur le serveur.",
    );
  }
  return buildOpenRouterHeaders(key);
}

async function getModels() {
  const ai = await getSetting("ai");
  return {
    textModel: ai.textModel || "openai/gpt-4o-mini",
    imageModel: ai.imageModel || "google/gemini-2.5-flash-image",
  };
}

/** Generation de texte via chat completions. */
export async function generateText(opts: {
  prompt: string;
  system?: string;
  model?: string;
  json?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const { textModel } = await getModels();
  const body: Record<string, unknown> = {
    model: opts.model || textModel,
    messages: [
      ...(opts.system ? [{ role: "system", content: opts.system }] : []),
      { role: "user", content: opts.prompt },
    ],
    max_tokens: opts.maxTokens ?? 4000,
  };
  if (opts.json) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: await openRouterHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 401) {
      throw new Error(
        "OpenRouter 401 : cle API invalide ou absente. Verifie Admin > Reglages ou OPENROUTER_API_KEY sur le serveur (cPanel > Setup Node.js App > Environment Variables).",
      );
    }
    throw new Error(`OpenRouter (texte) ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Reponse texte OpenRouter invalide");
  }
  return content;
}

function imageModalities(model: string): string[] {
  const imageOnly = /(flux|seedream|sourceful|recraft|imagen|dall-e|gpt-image|ideogram)/i;
  return imageOnly.test(model) ? ["image"] : ["image", "text"];
}

/**
 * Generation d'image. Essaie l'endpoint chat/completions (compatible Gemini et
 * multimodaux). Renvoie une data URL base64.
 */
export async function generateImage(opts: {
  prompt: string;
  model?: string;
  aspectRatio?: string;
}): Promise<string> {
  const { imageModel } = await getModels();
  const model = opts.model || imageModel;
  const headers = await openRouterHeaders();

  const body: Record<string, unknown> = {
    model,
    modalities: imageModalities(model),
    messages: [{ role: "user", content: opts.prompt }],
  };
  if (opts.aspectRatio) {
    body.image_config = { aspect_ratio: opts.aspectRatio };
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    const url = message?.images?.[0]?.image_url?.url;
    if (typeof url === "string" && url.startsWith("data:")) return url;
    // certains modeles renvoient l'image en contenu texte data url
    if (typeof message?.content === "string" && message.content.startsWith("data:")) {
      return message.content;
    }
  }

  // Fallback: endpoint dedie /images (b64_json)
  const res2 = await fetch(`${BASE}/images`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      prompt: opts.prompt,
      output_format: "png",
      ...(opts.aspectRatio ? { aspect_ratio: opts.aspectRatio } : {}),
    }),
  });

  if (!res2.ok) {
    const txt = await res2.text();
    throw new Error(`OpenRouter (image) ${res2.status}: ${txt.slice(0, 300)}`);
  }
  const data2 = await res2.json();
  const b64 = data2?.data?.[0]?.b64_json;
  const remote = data2?.data?.[0]?.url;
  if (typeof b64 === "string") return `data:image/png;base64,${b64}`;
  if (typeof remote === "string") return remote;

  throw new Error("Aucune image renvoyee par le modele");
}
