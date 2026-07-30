import Link from "next/link";
import type { NavLink } from "@/lib/settings";
import { MobileNavToggle } from "@/components/site/MobileNavToggle";

export type NavbarProps = {
  logoText: string;
  logoUrl: string | null;
  links: NavLink[];
};

function Logo({ logoText, logoUrl }: NavbarProps) {
  return (
    <Link
      href="/"
      className="site-nav-logo"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 800,
        fontSize: 20,
        color: "var(--color-heading)",
        textDecoration: "none",
        fontFamily: "var(--font-heading)",
      }}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={logoText} style={{ height: 32 }} />
      ) : (
        logoText
      )}
    </Link>
  );
}

function NavLinks({
  links,
  gap = 22,
  className = "",
}: {
  links: NavLink[];
  gap?: number;
  className?: string;
}) {
  return (
    <nav
      className={`site-nav-links${className ? ` ${className}` : ""}`}
      style={{ display: "flex", gap, alignItems: "center" }}
    >
      {links.map((l) => (
        <Link
          key={l.href + l.label}
          href={l.href}
          style={{
            color: "var(--color-text)",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

const wrap = (children: React.ReactNode, extra: React.CSSProperties = {}) => (
  <header
    className="site-nav-header"
    style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      ...extra,
    }}
  >
    <div
      className="site-nav-inner"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        ...(extra.flexDirection ? { flexDirection: extra.flexDirection } : {}),
      }}
    >
      {children}
    </div>
  </header>
);

function pill(): React.CSSProperties {
  return {
    background: "var(--color-primary)",
    color: "var(--color-primary-contrast)",
    padding: "8px 16px",
    borderRadius: "var(--radius)",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 14,
  };
}

// 1. Classique: logo a gauche, liens a droite
function NavClassic(p: NavbarProps) {
  return wrap(
    <>
      <Logo {...p} />
      <MobileNavToggle />
      <div className="site-nav-menu" style={{ marginLeft: "auto" }}>
        <NavLinks links={p.links} />
      </div>
    </>,
  );
}

// 2. Centre: logo centre, liens repartis
function NavCentered(p: NavbarProps) {
  return wrap(
    <>
      <Logo {...p} />
      <MobileNavToggle />
      <div className="site-nav-menu site-nav-menu-centered">
        <NavLinks links={p.links} />
      </div>
    </>,
    { flexDirection: "column" },
  );
}

// 3. Split: liens de part et d'autre du logo
function NavSplit(p: NavbarProps) {
  const half = Math.ceil(p.links.length / 2);
  return wrap(
    <>
      <div className="site-nav-split-bar-logo">
        <Logo {...p} />
      </div>
      <MobileNavToggle />
      <div className="site-nav-menu site-nav-menu-split" style={{ width: "100%" }}>
        <div className="site-nav-split-mobile-logo">
          <Logo {...p} />
        </div>
        <div className="site-nav-split-desktop">
          <NavLinks links={p.links.slice(0, half)} />
          <div className="site-nav-split-center">
            <Logo {...p} />
          </div>
          <NavLinks links={p.links.slice(half)} />
        </div>
        <NavLinks links={p.links} className="site-nav-links-mobile" />
      </div>
    </>,
  );
}

// 4. Avec bouton CTA a droite
function NavCta(p: NavbarProps) {
  return wrap(
    <>
      <Logo {...p} />
      <MobileNavToggle />
      <div
        className="site-nav-menu"
        style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 22 }}
      >
        <NavLinks links={p.links} />
        <Link href="/contact" className="site-nav-cta" style={pill()}>
          Nous contacter
        </Link>
      </div>
    </>,
  );
}

// 5. Avec champ de recherche
function NavSearch(p: NavbarProps) {
  return wrap(
    <>
      <Logo {...p} />
      <MobileNavToggle />
      <div
        className="site-nav-menu"
        style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}
      >
        <NavLinks links={p.links} />
        <form action="/recherche" className="site-nav-search" style={{ display: "flex" }}>
          <input
            name="q"
            placeholder="Rechercher..."
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: "7px 12px",
              fontSize: 14,
              background: "var(--color-bg)",
              color: "var(--color-text)",
              width: "100%",
              maxWidth: 220,
            }}
          />
        </form>
      </div>
    </>,
  );
}

// 6. Barre superieure coloree (accent) puis logo
function NavAccentBar(p: NavbarProps) {
  return (
    <header className="site-nav-header">
      <div style={{ background: "var(--color-primary)", height: 4 }} />
      <div
        className="site-nav-inner"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Logo {...p} />
        <MobileNavToggle />
        <div className="site-nav-menu" style={{ marginLeft: "auto" }}>
          <NavLinks links={p.links} />
        </div>
      </div>
    </header>
  );
}

// 7. Minimal: fine, liens en majuscules espacees
function NavMinimal(p: NavbarProps) {
  return wrap(
    <>
      <Logo {...p} />
      <MobileNavToggle />
      <div
        className="site-nav-menu"
        style={{ marginLeft: "auto", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 13 }}
      >
        <NavLinks links={p.links} gap={26} />
      </div>
    </>,
    { background: "var(--color-bg)" },
  );
}

// 8. Sombre (inverse) quel que soit le theme
function NavContrast(p: NavbarProps) {
  return (
    <header className="site-nav-header site-nav-contrast" style={{ background: "var(--color-heading)" }}>
      <div
        className="site-nav-inner"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/"
          className="site-nav-logo"
          style={{
            fontWeight: 800,
            fontSize: 20,
            color: "var(--color-bg)",
            textDecoration: "none",
            fontFamily: "var(--font-heading)",
          }}
        >
          {p.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logoUrl} alt={p.logoText} style={{ height: 32 }} />
          ) : (
            p.logoText
          )}
        </Link>
        <MobileNavToggle />
        <div className="site-nav-menu" style={{ marginLeft: "auto" }}>
          <nav className="site-nav-links" style={{ display: "flex", gap: 22 }}>
            {p.links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                style={{ color: "var(--color-bg)", textDecoration: "none", fontSize: 15, fontWeight: 500 }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// 9. Deux niveaux: marque + slogan puis liens sur fond surface
function NavStacked(p: NavbarProps) {
  return (
    <header className="site-nav-header site-nav-stacked" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px", textAlign: "center" }}>
        <Logo {...p} />
      </div>
      <div style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        <div
          className="site-nav-inner"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <MobileNavToggle />
          <div className="site-nav-menu">
            <NavLinks links={p.links} />
          </div>
        </div>
      </div>
    </header>
  );
}

// 10. Encadre "flottant" avec coins arrondis
function NavFloating(p: NavbarProps) {
  return (
    <header className="site-nav-header" style={{ background: "var(--color-bg)", padding: "14px 20px" }}>
      <div
        className="site-nav-inner"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "calc(var(--radius) + 8px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
        }}
      >
        <Logo {...p} />
        <MobileNavToggle />
        <div
          className="site-nav-menu"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}
        >
          <NavLinks links={p.links} />
          <Link href="/contact" className="site-nav-cta" style={pill()}>
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}

export const NAVBARS: {
  id: string;
  name: string;
  Component: (p: NavbarProps) => React.JSX.Element;
}[] = [
  { id: "nav-classic", name: "Classique (logo gauche)", Component: NavClassic },
  { id: "nav-centered", name: "Centre", Component: NavCentered },
  { id: "nav-split", name: "Split (liens de part et d'autre)", Component: NavSplit },
  { id: "nav-cta", name: "Avec bouton CTA", Component: NavCta },
  { id: "nav-search", name: "Avec recherche", Component: NavSearch },
  { id: "nav-accent", name: "Barre accent en haut", Component: NavAccentBar },
  { id: "nav-minimal", name: "Minimal majuscules", Component: NavMinimal },
  { id: "nav-contrast", name: "Contraste (fonce)", Component: NavContrast },
  { id: "nav-stacked", name: "Deux niveaux", Component: NavStacked },
  { id: "nav-floating", name: "Flottant arrondi", Component: NavFloating },
];

export function getNavbar(id: string) {
  return NAVBARS.find((n) => n.id === id) ?? NAVBARS[0];
}
