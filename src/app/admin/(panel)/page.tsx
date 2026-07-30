import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getViewStats } from "@/lib/stats";
import { getSetting } from "@/lib/settings";
import { ViewsChart } from "@/components/admin/ViewsChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [articles, published, pages, media, views, analytics] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.page.count(),
    prisma.media.count(),
    getViewStats(),
    getSetting("analytics"),
  ]);

  const analyticsActive = analytics.enabled && analytics.measurementId;

  const recent = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Articles", value: articles, href: "/admin/articles" },
    { label: "Publies", value: published, href: "/admin/articles" },
    { label: "Pages", value: pages, href: "/admin/pages" },
    { label: "Medias", value: media, href: "/admin/media" },
  ];

  const viewStats = [
    { label: "Vues aujourd'hui", value: views.today },
    { label: "Vues 7 jours", value: views.last7 },
    { label: "Vues 30 jours", value: views.last30 },
    { label: "Vues totales", value: views.total },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Tableau de bord</h1>
      <p className="admin-page-sub">
        Bienvenue. Gere ton contenu, ton apparence et tes publicites depuis ici.
      </p>

      <div
        className="admin-grid admin-grid-cols-4"
        style={{ marginBottom: 24 }}
      >
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-stat" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontWeight: 700, margin: "8px 0 14px" }}>
        Statistiques de visualisation
      </h2>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Google Analytics</h2>
            <p style={{ color: "var(--admin-muted)", fontSize: 14, margin: 0 }}>
              {analyticsActive
                ? `Suivi actif avec l'ID ${analytics.measurementId}. Les visiteurs sont comptabilises apres acceptation des cookies.`
                : "Google Analytics n'est pas encore configure. Active-le pour suivre l'audience de ton site."}
            </p>
          </div>
          <span
            className={`admin-badge ${analyticsActive ? "admin-badge-green" : "admin-badge-gray"}`}
          >
            {analyticsActive ? "Actif" : "Inactif"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {analyticsActive && (
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-primary"
            >
              Ouvrir Google Analytics
            </a>
          )}
          <Link href="/admin/reglages" className="admin-btn">
            {analyticsActive ? "Modifier la configuration" : "Configurer Google Analytics"}
          </Link>
        </div>
      </div>

      <div
        className="admin-grid admin-grid-cols-4"
        style={{ marginBottom: 24 }}
      >
        {viewStats.map((s) => (
          <div key={s.label} className="admin-stat">
            <div className="admin-stat-value">{s.value.toLocaleString("fr-FR")}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid admin-grid-chart" style={{ marginBottom: 24 }}>
        <div className="admin-card">
          <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Vues des 7 derniers jours</h2>
          <ViewsChart series={views.series} />
        </div>

        <div className="admin-card">
          <h2 style={{ fontWeight: 700, marginBottom: 14 }}>Articles les plus vus</h2>
          {views.topArticles.length === 0 ? (
            <p style={{ color: "var(--admin-muted)", fontSize: 14 }}>
              Pas encore de donnees. Les vues apparaitront ici.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {views.topArticles.map((a) => (
                <a
                  key={a.refId}
                  href={a.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--admin-border)",
                    textDecoration: "none",
                    color: "inherit",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.title}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--admin-primary)" }}>
                    {a.count.toLocaleString("fr-FR")}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-grid admin-grid-cols-2">
        <div className="admin-card">
          <h2 style={{ fontWeight: 700, marginBottom: 14 }}>Actions rapides</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/admin/articles/new" className="admin-btn admin-btn-primary">
              + Nouvel article
            </Link>
            <Link href="/admin/pages/new" className="admin-btn">
              + Nouvelle page
            </Link>
            <Link href="/admin/ia" className="admin-btn">
              Generer un article avec l&apos;IA
            </Link>
            <Link href="/admin/apparence" className="admin-btn">
              Changer le theme
            </Link>
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontWeight: 700, marginBottom: 14 }}>Articles recents</h2>
          {recent.length === 0 ? (
            <p style={{ color: "var(--admin-muted)", fontSize: 14 }}>
              Aucun article pour le moment.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/articles/${a.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--admin-border)",
                    textDecoration: "none",
                    color: "inherit",
                    fontSize: 14,
                  }}
                >
                  <span>{a.title}</span>
                  <span
                    className={`admin-badge ${a.status === "published" ? "admin-badge-green" : "admin-badge-gray"}`}
                  >
                    {a.status === "published" ? "Publie" : "Brouillon"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
