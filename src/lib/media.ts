import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "./prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

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
      url: `/uploads/${filename}`,
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

export async function saveMediaFromUrl(
  url: string,
  opts: { alt?: string; source?: "upload" | "ai"; prompt?: string } = {},
) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Telechargement de l'image echoue");
  const mime = res.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await res.arrayBuffer());
  return saveMediaFromBuffer({ buffer, mime, ...opts });
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;
  if (media.url.startsWith("/uploads/")) {
    const filePath = path.join(UPLOAD_DIR, path.basename(media.url));
    await fs.unlink(filePath).catch(() => {});
  }
  await prisma.media.delete({ where: { id } });
}
