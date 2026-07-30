import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Enregistre une vue de page. Appele cote client au chargement.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { path?: string } | null;
    let path = body?.path;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Normalise: enleve les query/hash, garde le pathname
    try {
      path = new URL(path, "http://x").pathname;
    } catch {
      // deja un pathname
    }
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    // On ne traque pas l'admin ni les routes techniques
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
      return NextResponse.json({ ok: false }, { status: 204 });
    }

    // Resout le type et l'id de reference
    let type: "article" | "page" | "other" = "other";
    let refId: string | null = null;

    if (path.startsWith("/article/")) {
      const slug = decodeURIComponent(path.slice("/article/".length));
      const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (article) {
        type = "article";
        refId = article.id;
      }
    } else {
      const page = await prisma.page.findUnique({
        where: { path },
        select: { id: true },
      });
      if (page) {
        type = "page";
        refId = page.id;
      }
    }

    await prisma.pageView.create({
      data: { path, type, refId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
