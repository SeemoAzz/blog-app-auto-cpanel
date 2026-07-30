import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ArticlesListPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Articles</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            {articles.length} article(s)
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link href="/admin/ia" className="admin-btn">
            Generer avec l&apos;IA
          </Link>
          <Link href="/admin/articles/new" className="admin-btn admin-btn-primary">
            + Nouvel article
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="admin-card">
          <p style={{ color: "var(--admin-muted)" }}>
            Aucun article. Cree ton premier article ou genere-le avec l&apos;IA.
          </p>
        </div>
      ) : (
        <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Categorie</th>
              <th>Langue</th>
              <th>Statut</th>
              <th>Modifie</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    style={{ fontWeight: 600, textDecoration: "none", color: "var(--admin-text)" }}
                  >
                    {a.title}
                  </Link>
                </td>
                <td>{a.category?.name || "-"}</td>
                <td style={{ textTransform: "uppercase", fontSize: 12 }}>{a.locale}</td>
                <td>
                  <span
                    className={`admin-badge ${a.status === "published" ? "admin-badge-green" : "admin-badge-gray"}`}
                  >
                    {a.status === "published" ? "Publie" : "Brouillon"}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: "var(--admin-muted)" }}>
                  {a.updatedAt.toLocaleDateString("fr-FR")}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {a.status === "published" && (
                      <Link
                        href={`/article/${a.slug}`}
                        target="_blank"
                        className="admin-btn admin-btn-sm"
                      >
                        Voir
                      </Link>
                    )}
                    <Link href={`/admin/articles/${a.id}`} className="admin-btn admin-btn-sm">
                      Editer
                    </Link>
                    <DeleteButton id={a.id} kind="article" />
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
