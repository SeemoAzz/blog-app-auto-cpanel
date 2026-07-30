"use client";

type Props = {
  email: string;
};

// Barre superieure admin avec bouton menu pour mobile/tablette.
export function AdminTopbar({ email }: Props) {
  const toggleSidebar = () => {
    const layout = document.querySelector(".admin-layout");
    layout?.classList.toggle("admin-sidebar-open");
  };

  const closeSidebar = () => {
    document.querySelector(".admin-layout")?.classList.remove("admin-sidebar-open");
  };

  return (
    <>
      <div
        className="admin-sidebar-backdrop"
        onClick={closeSidebar}
        aria-hidden
      />
      <div className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="admin-menu-toggle"
            aria-label="Ouvrir le menu"
            onClick={toggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>
          <div style={{ fontWeight: 600 }}>Espace d&apos;administration</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--admin-muted)" }}>{email}</div>
      </div>
    </>
  );
}
