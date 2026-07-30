import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deleteMedia } from "@/lib/media";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const media = await prisma.media.update({
    where: { id },
    data: { alt: typeof body.alt === "string" ? body.alt : undefined },
  });
  return NextResponse.json({ item: media });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }
  const { id } = await params;
  await deleteMedia(id);
  return NextResponse.json({ ok: true });
}
