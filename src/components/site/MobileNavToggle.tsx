"use client";

// Bouton hamburger pour ouvrir/fermer le menu sur mobile et tablette.
export function MobileNavToggle() {
  return (
    <button
      type="button"
      className="site-nav-toggle"
      aria-label="Ouvrir le menu"
      onClick={(e) => {
        const header = e.currentTarget.closest(".site-nav-header");
        if (!header) return;
        const open = header.classList.toggle("site-nav-open");
        e.currentTarget.setAttribute("aria-expanded", open ? "true" : "false");
        e.currentTarget.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      }}
    >
      <span className="site-nav-toggle-bar" />
      <span className="site-nav-toggle-bar" />
      <span className="site-nav-toggle-bar" />
    </button>
  );
}
