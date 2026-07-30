import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "../actions";
import { AdminNav } from "./AdminNav";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Blog Admin</div>
        <AdminNav />
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <Link
            href="/"
            target="_blank"
            className="admin-btn admin-btn-sm"
            style={{ width: "100%", marginBottom: 8 }}
          >
            Voir le site
          </Link>
          <form action={logoutAction}>
            <button className="admin-btn admin-btn-sm" style={{ width: "100%" }}>
              Se deconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <AdminTopbar email={session.email} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
