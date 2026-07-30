import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { PublicRender } from "@/components/PublicRender";

export const dynamic = "force-dynamic";

async function getHome() {
  return prisma.page.findFirst({
    where: { status: "published", OR: [{ isHome: true }, { path: "/" }] },
    orderBy: { isHome: "desc" },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getHome(), getSetting("site")]);
  return {
    title: page?.metaTitle || site.title,
    description: page?.metaDescription || site.description,
    openGraph: {
      title: page?.metaTitle || site.title,
      description: page?.metaDescription || site.description,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const page = await getHome();

  if (!page) {
    return (
      <div style={{ maxWidth: 720, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--color-heading)" }}>
          Bienvenue !
        </h1>
        <p style={{ color: "var(--color-muted)", marginTop: 12 }}>
          Aucune page d&apos;accueil n&apos;est encore publiee. Connecte-toi au
          tableau de bord pour en creer une.
        </p>
        <Link
          href="/admin"
          style={{
            display: "inline-block",
            marginTop: 20,
            background: "var(--color-primary)",
            color: "var(--color-primary-contrast)",
            padding: "12px 24px",
            borderRadius: "var(--radius)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Aller au tableau de bord
        </Link>
      </div>
    );
  }

  return <PublicRender puckData={page.puckData} />;
}
