import Link from "next/link";

export type HeroProps = {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  align?: "left" | "center" | "right";
  mediaUrl?: string;
};

function primaryBtn(): React.CSSProperties {
  return {
    display: "inline-block",
    background: "var(--color-primary)",
    color: "var(--color-primary-contrast)",
    padding: "12px 24px",
    borderRadius: "var(--radius)",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: 16,
  };
}

const container = (children: React.ReactNode, style: React.CSSProperties = {}) => (
  <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", ...style }}>{children}</div>
);

function Cta({ label, href }: { label?: string; href?: string }) {
  if (!label) return null;
  return (
    <Link href={href || "#"} style={primaryBtn()}>
      {label}
    </Link>
  );
}

// 1. Centre simple
function HeroCentered(p: HeroProps) {
  return (
    <section className="site-hero-section" style={{ padding: "80px 0", background: "var(--color-surface)" }}>
      {container(
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <h1 className="site-hero-title" style={{ fontSize: 48, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 19, color: "var(--color-muted)", marginTop: 16 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 28 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
        </div>,
      )}
    </section>
  );
}

// 2. Split texte/image
function HeroSplit(p: HeroProps) {
  return (
    <section style={{ padding: "70px 0", background: "var(--color-bg)" }}>
      {container(
        <div className="site-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <h1 className="site-hero-title" style={{ fontSize: 44, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}>{p.title}</h1>
            {p.subtitle && <p style={{ fontSize: 18, color: "var(--color-muted)", marginTop: 16 }}>{p.subtitle}</p>}
            <div style={{ marginTop: 26 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
          </div>
          <div>
            {p.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.mediaUrl} alt="" style={{ width: "100%", borderRadius: "calc(var(--radius) + 6px)" }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--color-surface)", borderRadius: "calc(var(--radius) + 6px)", border: "1px solid var(--color-border)" }} />
            )}
          </div>
        </div>,
      )}
    </section>
  );
}

// 3. Image de fond plein ecran
function HeroBackground(p: HeroProps) {
  return (
    <section
      style={{
        position: "relative",
        padding: "120px 0",
        color: "#fff",
        backgroundImage: p.mediaUrl
          ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.55)), url(${p.mediaUrl})`
          : "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {container(
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <h1 className="site-hero-title" style={{ fontSize: 52, fontWeight: 900, fontFamily: "var(--font-heading)", lineHeight: 1.05 }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 20, marginTop: 16, opacity: 0.92 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 30 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
        </div>,
      )}
    </section>
  );
}

// 4. Degrade
function HeroGradient(p: HeroProps) {
  return (
    <section style={{ padding: "90px 0", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", color: "var(--color-primary-contrast)" }}>
      {container(
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <h1 className="site-hero-title" style={{ fontSize: 50, fontWeight: 900, fontFamily: "var(--font-heading)", lineHeight: 1.08 }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 19, marginTop: 16, opacity: 0.92 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 28 }}>
            {p.buttonLabel && (
              <Link href={p.buttonHref || "#"} style={{ display: "inline-block", background: "var(--color-bg)", color: "var(--color-heading)", padding: "12px 26px", borderRadius: "var(--radius)", fontWeight: 700, textDecoration: "none" }}>{p.buttonLabel}</Link>
            )}
          </div>
        </div>,
      )}
    </section>
  );
}

// 5. Minimal aligne a gauche
function HeroMinimal(p: HeroProps) {
  return (
    <section style={{ padding: "64px 0", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
      {container(
        <div style={{ maxWidth: 760 }}>
          <h1 className="site-hero-title" style={{ fontSize: 42, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)" }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 18, color: "var(--color-muted)", marginTop: 12 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 22 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
        </div>,
      )}
    </section>
  );
}

// 6. Carte encadree
function HeroCard(p: HeroProps) {
  return (
    <section style={{ padding: "48px 0", background: "var(--color-bg)" }}>
      {container(
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "calc(var(--radius) + 10px)", padding: "60px 40px", textAlign: "center" }}>
          <h1 className="site-hero-title" style={{ fontSize: 46, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)" }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 18, color: "var(--color-muted)", marginTop: 14, maxWidth: 640, margin: "14px auto 0" }}>{p.subtitle}</p>}
          <div style={{ marginTop: 26 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
        </div>,
      )}
    </section>
  );
}

// 7. Grand titre editorial
function HeroEditorial(p: HeroProps) {
  return (
    <section style={{ padding: "80px 0", background: "var(--color-bg)" }}>
      {container(
        <div>
          <h1 className="site-hero-title" style={{ fontSize: 72, fontWeight: 900, color: "var(--color-heading)", fontFamily: "var(--font-heading)", lineHeight: 0.98, letterSpacing: "-0.02em", maxWidth: 1000 }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 20, color: "var(--color-muted)", marginTop: 24, maxWidth: 640 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 28 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
        </div>,
      )}
    </section>
  );
}

// 8. Image au dessus, texte dessous
function HeroImageTop(p: HeroProps) {
  return (
    <section style={{ padding: "48px 0", background: "var(--color-surface)" }}>
      {container(
        <div style={{ textAlign: "center" }}>
          {p.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.mediaUrl} alt="" style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: "calc(var(--radius) + 6px)", marginBottom: 28 }} />
          )}
          <h1 className="site-hero-title" style={{ fontSize: 46, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)" }}>{p.title}</h1>
          {p.subtitle && <p style={{ fontSize: 18, color: "var(--color-muted)", marginTop: 12 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 22 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
        </div>,
      )}
    </section>
  );
}

// 9. Bandeau compact accent
function HeroBanner(p: HeroProps) {
  return (
    <section style={{ padding: "40px 0", background: "var(--color-primary)", color: "var(--color-primary-contrast)" }}>
      {container(
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 className="site-hero-title" style={{ fontSize: 34, fontWeight: 800, fontFamily: "var(--font-heading)" }}>{p.title}</h1>
            {p.subtitle && <p style={{ fontSize: 16, marginTop: 6, opacity: 0.9 }}>{p.subtitle}</p>}
          </div>
          {p.buttonLabel && (
            <Link href={p.buttonHref || "#"} style={{ background: "var(--color-bg)", color: "var(--color-heading)", padding: "12px 24px", borderRadius: "var(--radius)", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>{p.buttonLabel}</Link>
          )}
        </div>,
      )}
    </section>
  );
}

// 10. Duo colonnes avec fond degrade doux
function HeroSoft(p: HeroProps) {
  return (
    <section style={{ padding: "72px 0", background: "color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))" }}>
      {container(
        <div className="site-grid-2" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>
          <div>
            <span style={{ display: "inline-block", background: "color-mix(in srgb, var(--color-primary) 18%, transparent)", color: "var(--color-primary)", padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Blog</span>
            <h1 className="site-hero-title" style={{ fontSize: 46, fontWeight: 800, color: "var(--color-heading)", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}>{p.title}</h1>
            {p.subtitle && <p style={{ fontSize: 18, color: "var(--color-muted)", marginTop: 14 }}>{p.subtitle}</p>}
            <div style={{ marginTop: 24 }}><Cta label={p.buttonLabel} href={p.buttonHref} /></div>
          </div>
          <div>
            {p.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.mediaUrl} alt="" style={{ width: "100%", borderRadius: "calc(var(--radius) + 8px)", boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "1/1", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", borderRadius: "calc(var(--radius) + 8px)" }} />
            )}
          </div>
        </div>,
      )}
    </section>
  );
}

export const HEROES: {
  id: string;
  name: string;
  Component: (p: HeroProps) => React.JSX.Element;
}[] = [
  { id: "hero-centered", name: "Centre", Component: HeroCentered },
  { id: "hero-split", name: "Split texte/image", Component: HeroSplit },
  { id: "hero-background", name: "Image de fond", Component: HeroBackground },
  { id: "hero-gradient", name: "Degrade", Component: HeroGradient },
  { id: "hero-minimal", name: "Minimal gauche", Component: HeroMinimal },
  { id: "hero-card", name: "Carte encadree", Component: HeroCard },
  { id: "hero-editorial", name: "Editorial (grand titre)", Component: HeroEditorial },
  { id: "hero-imagetop", name: "Image au dessus", Component: HeroImageTop },
  { id: "hero-banner", name: "Bandeau accent", Component: HeroBanner },
  { id: "hero-soft", name: "Doux deux colonnes", Component: HeroSoft },
];

export function getHero(id: string) {
  return HEROES.find((h) => h.id === id) ?? HEROES[0];
}

export const HERO_OPTIONS = HEROES.map((h) => ({ label: h.name, value: h.id }));
