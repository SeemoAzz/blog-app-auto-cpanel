import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "./prisma";

/** Stockage hors public/ — servi dynamiquement via /api/uploads/[filename] */
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const LEGACY_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  bin: "application/octet-stream",
};

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

/** URL publique servie a la volee (pas de cache statique Next.js). */
export function mediaPublicUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}

/** Convertit les anciennes URLs /uploads/... vers /api/uploads/... */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/uploads/")) {
    return mediaPublicUrl(url.slice("/uploads/".length));
  }
  return url;
}

export function resolveMediaUrlsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return (resolveMediaUrl(value) ?? value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveMediaUrlsDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = resolveMediaUrlsDeep(val);
    }
    return out as T;
  }
  return value;
}

function safeFilename(filename: string): string | null {
  const base = path.basename(filename);
  if (!base || base !== filename || base.includes("..")) return null;
  return base;
}

export function getUploadMime(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

export async function readUploadFile(
  filename: string,
): Promise<{ buffer: Buffer; mime: string } | null> {
  const safe = safeFilename(filename);
  if (!safe) return null;

  for (const dir of [UPLOAD_DIR, LEGACY_UPLOAD_DIR]) {
    try {
      const buffer = await fs.readFile(path.join(dir, safe));
      return { buffer, mime: getUploadMime(safe) };
    } catch {
      // essayer l'autre dossier
    }
  }
  return null;
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function pickExt(mime: string, filename?: string): string {
  if (EXT_BY_MIME[mime]) return EXT_BY_MIME[mime];
  if (filename) {
    const e = path.extname(filename).replace(".", "").toLowerCase();
    if (e) return e;
  }
  return "bin";
}

async function getDimensions(
  buffer: Buffer,
): Promise<{ width: number | null; height: number | null }> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

export async function saveMediaFromBuffer(opts: {
  buffer: Buffer;
  mime: string;
  originalName?: string;
  alt?: string;
  source?: "upload" | "ai";
  prompt?: string;
}) {
  await ensureDir();
  const ext = pickExt(opts.mime, opts.originalName);
  const id = crypto.randomBytes(10).toString("hex");
  const filename = `${Date.now().toString(36)}-${id}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filePath, opts.buffer);

  const { width, height } =
    opts.mime === "image/svg+xml"
      ? { width: null, height: null }
      : await getDimensions(opts.buffer);

  const media = await prisma.media.create({
    data: {
      filename: opts.originalName || filename,
      url: mediaPublicUrl(filename),
      mime: opts.mime,
      size: opts.buffer.length,
      width,
      height,
      alt: opts.alt || null,
      source: opts.source || "upload",
      prompt: opts.prompt || null,
    },
  });

  return media;
}

export async function saveMediaFromDataUrl(
  dataUrl: string,
  opts: { alt?: string; source?: "upload" | "ai"; prompt?: string } = {},
) {
  const match = /^data:([^;]+);base64,([\s\S]*)$/.exec(dataUrl);
  if (!match) throw new Error("Data URL invalide");
  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  return saveMediaFromBuffer({ buffer, mime, ...opts });
}

function normalizeRemoteImageUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

async function fetchRemoteImageBuffer(
  url: string,
  referer?: string,
): Promise<{ buffer: Buffer; mime: string }> {
  const normalized = normalizeRemoteImageUrl(url);
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("URL d'image invalide");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Protocole d'image non supporte");
  }

  const res = await fetch(normalized, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: referer || `${parsed.protocol}//${parsed.host}/`,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Telechargement echoue (${res.status})`);
  }

  const rawBuffer = Buffer.from(await res.arrayBuffer());
  if (rawBuffer.length < 128) {
    throw new Error("Fichier image trop petit ou vide");
  }

  const contentType = (res.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (contentType.startsWith("text/") || contentType.includes("html")) {
    throw new Error("Le serveur a renvoye du HTML au lieu d'une image");
  }

  const sharp = (await import("sharp")).default;
  let meta;
  try {
    meta = await sharp(rawBuffer).metadata();
  } catch {
    throw new Error("Contenu recu n'est pas une image valide");
  }
  if (!meta.width || !meta.height) {
    throw new Error("Dimensions image invalides");
  }

  if (meta.format === "svg") {
    return { buffer: rawBuffer, mime: "image/svg+xml" };
  }

  const webpBuffer = await sharp(rawBuffer).webp({ quality: 85 }).toBuffer();
  return { buffer: webpBuffer, mime: "image/webp" };
}

export async function saveMediaFromUrl(
  url: string,
  opts: {
    alt?: string;
    source?: "upload" | "ai";
    prompt?: string;
    referer?: string;
  } = {},
) {
  const { buffer, mime } = await fetchRemoteImageBuffer(url, opts.referer);
  return saveMediaFromBuffer({ buffer, mime, ...opts });
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;

  const filename = path.basename(
    media.url.replace(/^\/api\/uploads\//, "").replace(/^\/uploads\//, ""),
  );
  for (const dir of [UPLOAD_DIR, LEGACY_UPLOAD_DIR]) {
    await fs.unlink(path.join(dir, filename)).catch(() => {});
  }
  await prisma.media.delete({ where: { id } });
}
