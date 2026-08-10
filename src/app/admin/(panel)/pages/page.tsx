import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureArticlesPage, isArticlesPage } from "@/lib/articles-page";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function PagesListPage() {
  await ensureArticlesPage();

  const pages = await prisma.page.findMany({
    orderBy: [{ isHome: "desc" }, { navOrder: "asc" }, { updatedAt: "desc" }],
  });

  const homePages = pages.filter((p) => p.isHome);
  const articlesPages = pages.filter((p) => isArticlesPage(p));
  const otherPages = pages.filter((p) => !p.isHome && !isArticlesPage(p));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pages</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            {pages.length} page(s) — accueil, liste des articles, pages secondaires, pages legales
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link href="/admin/pages/new" className="admin-btn admin-btn-primary">
            + Nouvelle page
          </Link>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="admin-card">
          <p style={{ color: "var(--admin-muted)" }}>Aucune page.</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Chemin</th>
                <th>Menu</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {homePages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/pages/${p.id}`}
                      style={{ fontWeight: 600, textDecoration: "none", color: "var(--admin-text)" }}
                    >
                      {p.title}
                      <span className="admin-badge admin-badge-green" style={{ marginLeft: 8 }}>
                        Accueil
                      </span>
                    </Link>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{p.path}</td>
                  <td>{p.showInNav ? "Oui" : "-"}</td>
                  <td>
                    <span
                      className={`admin-badge ${p.status === "published" ? "admin-badge-green" : "admin-badge-gray"}`}
                    >
                      {p.status === "published" ? "Publie" : "Brouillon"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {p.status === "published" && (
                        <Link href={p.path} target="_blank" className="admin-btn admin-btn-sm">
                          Voir
                        </Link>
                      )}
                      <Link href={`/admin/pages/${p.id}`} className="admin-btn admin-btn-sm">
                        Editer
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {articlesPages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/pages/${p.id}`}
                      style={{ fontWeight: 600, textDecoration: "none", color: "var(--admin-text)" }}
                    >
                      {p.title}
                      <span className="admin-badge admin-badge-green" style={{ marginLeft: 8 }}>
                        Articles
                      </span>
                    </Link>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{p.path}</td>
                  <td>{p.showInNav ? "Oui" : "-"}</td>
                  <td>
                    <span
                      className={`admin-badge ${p.status === "published" ? "admin-badge-green" : "admin-badge-gray"}`}
                    >
                      {p.status === "published" ? "Publie" : "Brouillon"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {p.status === "published" && (
                        <Link href={p.path} target="_blank" className="admin-btn admin-btn-sm">
                          Voir
                        </Link>
                      )}
                      <Link href={`/admin/pages/${p.id}`} className="admin-btn admin-btn-sm">
                        Editer
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {otherPages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/pages/${p.id}`}
                      style={{ fontWeight: 600, textDecoration: "none", color: "var(--admin-text)" }}
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{p.path}</td>
                  <td>{p.showInNav ? "Oui" : "-"}</td>
                  <td>
                    <span
                      className={`admin-badge ${p.status === "published" ? "admin-badge-green" : "admin-badge-gray"}`}
                    >
                      {p.status === "published" ? "Publie" : "Brouillon"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {p.status === "published" && (
                        <Link href={p.path} target="_blank" className="admin-btn admin-btn-sm">
                          Voir
                        </Link>
                      )}
                      <Link href={`/admin/pages/${p.id}`} className="admin-btn admin-btn-sm">
                        Editer
                      </Link>
                      {!p.isHome && !isArticlesPage(p) && <DeleteButton id={p.id} kind="page" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
