import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { PublicRender } from "@/components/PublicRender";

export const dynamic = "force-dynamic";

type Params = { path: string[] };

function toPath(segments: string[]): string {
  return "/" + segments.map((s) => decodeURIComponent(s)).join("/");
}

async function getPage(segments: string[]) {
  const path = toPath(segments);
  return prisma.page.findFirst({
    where: { path, status: "published" },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { path } = await params;
  const page = await getPage(path);
  if (!page) return { title: "Page introuvable" };
  const site = await getSetting("site");
  return {
    title: page.metaTitle || `${page.title} - ${site.title}`,
    description: page.metaDescription || undefined,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
      type: "website",
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { path } = await params;
  const page = await getPage(path);
  if (!page) notFound();

  return <PublicRender puckData={page.puckData} />;
}
