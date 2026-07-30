import Link from "next/link";
import type { NavLink } from "@/lib/settings";

export type FooterProps = {
  siteTitle: string;
  description: string;
  links: NavLink[];
  legalLinks: NavLink[];
};

const year = new Date().getFullYear();

function footerShell(children: React.ReactNode, extra: React.CSSProperties = {}) {
  return (
    <footer
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text)",
        marginTop: 48,
        ...extra,
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
        {children}
      </div>
    </footer>
  );
}

function linkStyle(): React.CSSProperties {
  return { color: "var(--color-text)", textDecoration: "none", fontSize: 14, display: "block", padding: "3px 0" };
}

// 1. Colonnes
function FooterColumns(p: FooterProps) {
  return footerShell(
    <>
      <div className="site-grid-3" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 32 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-heading)", color: "var(--color-heading)" }}>
            {p.siteTitle}
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 8, maxWidth: 360 }}>{p.description}</p>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Navigation</div>
          {p.links.map((l) => (
            <Link key={l.href} href={l.href} style={linkStyle()}>{l.label}</Link>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Legal</div>
          {p.legalLinks.map((l) => (
            <Link key={l.href} href={l.href} style={linkStyle()}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 28, paddingTop: 18, color: "var(--color-muted)", fontSize: 13 }}>
        &copy; {year} {p.siteTitle}. Tous droits reserves.
      </div>
    </>,
  );
}

// 2. Centre simple
function FooterCentered(p: FooterProps) {
  return footerShell(
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 800, fontSize: 20, fontFamily: "var(--font-heading)", color: "var(--color-heading)" }}>{p.siteTitle}</div>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", margin: "16px 0", flexWrap: "wrap" }}>
        {[...p.links, ...p.legalLinks].map((l) => (
          <Link key={l.href + l.label} href={l.href} style={{ ...linkStyle(), display: "inline" }}>{l.label}</Link>
        ))}
      </div>
      <div style={{ color: "var(--color-muted)", fontSize: 13 }}>&copy; {year} {p.siteTitle}</div>
    </div>,
  );
}

// 3. Minimal une ligne
function FooterMinimal(p: FooterProps) {
  return footerShell(
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <div style={{ color: "var(--color-muted)", fontSize: 13 }}>&copy; {year} {p.siteTitle}</div>
      <div style={{ display: "flex", gap: 16 }}>
        {p.legalLinks.map((l) => (
          <Link key={l.href} href={l.href} style={{ ...linkStyle(), display: "inline" }}>{l.label}</Link>
        ))}
      </div>
    </div>,
    { marginTop: 32 },
  );
}

// 4. Sombre (contraste)
function FooterDark(p: FooterProps) {
  return (
    <footer style={{ background: "var(--color-heading)", color: "var(--color-bg)", marginTop: 48 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
        <div className="site-grid-3" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{p.siteTitle}</div>
            <p style={{ opacity: 0.7, fontSize: 14, marginTop: 8, maxWidth: 360 }}>{p.description}</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Navigation</div>
            {p.links.map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "var(--color-bg)", textDecoration: "none", fontSize: 14, display: "block", padding: "3px 0", opacity: 0.85 }}>{l.label}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Legal</div>
            {p.legalLinks.map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "var(--color-bg)", textDecoration: "none", fontSize: 14, display: "block", padding: "3px 0", opacity: 0.85 }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 28, paddingTop: 18, opacity: 0.6, fontSize: 13 }}>
          &copy; {year} {p.siteTitle}
        </div>
      </div>
    </footer>
  );
}

// 5. CTA newsletter
function FooterNewsletter(p: FooterProps) {
  return footerShell(
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--color-heading)" }}>Reste informe</div>
          <div style={{ color: "var(--color-muted)", fontSize: 14 }}>Recois les nouveaux articles par email.</div>
        </div>
        <form action="/contact" style={{ display: "flex", gap: 8 }}>
          <input name="email" placeholder="ton@email.com" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "9px 12px", background: "var(--color-bg)", color: "var(--color-text)" }} />
          <button style={{ background: "var(--color-primary)", color: "var(--color-primary-contrast)", border: "none", borderRadius: "var(--radius)", padding: "9px 16px", fontWeight: 600 }}>S&apos;inscrire</button>
        </form>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, color: "var(--color-muted)", fontSize: 13, flexWrap: "wrap", gap: 12 }}>
        <div>&copy; {year} {p.siteTitle}</div>
        <div style={{ display: "flex", gap: 14 }}>
          {p.legalLinks.map((l) => (<Link key={l.href} href={l.href} style={{ ...linkStyle(), display: "inline" }}>{l.label}</Link>))}
        </div>
      </div>
    </>,
  );
}

// 6. Grand logo
function FooterBigLogo(p: FooterProps) {
  return footerShell(
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 900, fontSize: 42, fontFamily: "var(--font-heading)", color: "var(--color-heading)", letterSpacing: "-0.02em" }}>{p.siteTitle}</div>
      <div style={{ display: "flex", gap: 18, justifyContent: "center", margin: "18px 0", flexWrap: "wrap" }}>
        {[...p.links, ...p.legalLinks].map((l) => (<Link key={l.href + l.label} href={l.href} style={{ ...linkStyle(), display: "inline" }}>{l.label}</Link>))}
      </div>
      <div style={{ color: "var(--color-muted)", fontSize: 13 }}>&copy; {year}</div>
    </div>,
  );
}

// 7. Quatre colonnes
function FooterFourCols(p: FooterProps) {
  const chunks = [p.links, p.legalLinks];
  return footerShell(
    <>
      <div className="site-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--color-heading)" }}>{p.siteTitle}</div>
          <p style={{ color: "var(--color-muted)", fontSize: 13, marginTop: 8 }}>{p.description}</p>
        </div>
        {chunks.map((c, i) => (
          <div key={i}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{i === 0 ? "Navigation" : "Legal"}</div>
            {c.map((l) => (<Link key={l.href} href={l.href} style={linkStyle()}>{l.label}</Link>))}
          </div>
        ))}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Suivez-nous</div>
          <div style={{ color: "var(--color-muted)", fontSize: 14 }}>Facebook<br />Twitter / X<br />Instagram</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 24, paddingTop: 16, color: "var(--color-muted)", fontSize: 13 }}>&copy; {year} {p.siteTitle}</div>
    </>,
  );
}

// 8. Accent full-width
function FooterAccent(p: FooterProps) {
  return (
    <footer style={{ background: "var(--color-primary)", color: "var(--color-primary-contrast)", marginTop: 48 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>{p.siteTitle}</div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[...p.links, ...p.legalLinks].map((l) => (
            <Link key={l.href + l.label} href={l.href} style={{ color: "var(--color-primary-contrast)", textDecoration: "none", fontSize: 14, opacity: 0.9 }}>{l.label}</Link>
          ))}
        </div>
        <div style={{ opacity: 0.85, fontSize: 13, width: "100%", textAlign: "center", marginTop: 8 }}>&copy; {year} {p.siteTitle}</div>
      </div>
    </footer>
  );
}

// 9. Bordure epaisse en haut
function FooterTopBorder(p: FooterProps) {
  return footerShell(
    <>
      <div className="site-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--color-heading)" }}>{p.siteTitle}</div>
          <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 8 }}>{p.description}</p>
        </div>
        <div style={{ display: "flex", gap: 40, justifyContent: "flex-end" }}>
          <div>{p.links.map((l) => (<Link key={l.href} href={l.href} style={linkStyle()}>{l.label}</Link>))}</div>
          <div>{p.legalLinks.map((l) => (<Link key={l.href} href={l.href} style={linkStyle()}>{l.label}</Link>))}</div>
        </div>
      </div>
      <div style={{ marginTop: 24, color: "var(--color-muted)", fontSize: 13 }}>&copy; {year} {p.siteTitle}</div>
    </>,
    { borderTop: "4px solid var(--color-primary)" },
  );
}

// 10. Compact legal only
function FooterCompact(p: FooterProps) {
  return (
    <footer style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", marginTop: 40 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px", display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", color: "var(--color-muted)", fontSize: 13 }}>
        <span>&copy; {year} {p.siteTitle}</span>
        {p.legalLinks.map((l) => (<Link key={l.href} href={l.href} style={{ color: "var(--color-muted)", textDecoration: "none" }}>{l.label}</Link>))}
      </div>
    </footer>
  );
}

export const FOOTERS: {
  id: string;
  name: string;
  Component: (p: FooterProps) => React.JSX.Element;
}[] = [
  { id: "footer-columns", name: "Colonnes", Component: FooterColumns },
  { id: "footer-centered", name: "Centre", Component: FooterCentered },
  { id: "footer-minimal", name: "Minimal une ligne", Component: FooterMinimal },
  { id: "footer-dark", name: "Sombre", Component: FooterDark },
  { id: "footer-newsletter", name: "Newsletter", Component: FooterNewsletter },
  { id: "footer-biglogo", name: "Grand logo", Component: FooterBigLogo },
  { id: "footer-fourcols", name: "Quatre colonnes", Component: FooterFourCols },
  { id: "footer-accent", name: "Accent pleine largeur", Component: FooterAccent },
  { id: "footer-topborder", name: "Bordure epaisse", Component: FooterTopBorder },
  { id: "footer-compact", name: "Compact legal", Component: FooterCompact },
];

export function getFooter(id: string) {
  return FOOTERS.find((f) => f.id === id) ?? FOOTERS[0];
}
