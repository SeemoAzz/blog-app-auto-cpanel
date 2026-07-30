"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PALETTES, paletteToCssVars } from "@/theme/palettes";
import { FONT_PAIRS, fontCssVars, fontStylesheetHref } from "@/theme/fonts";
import { NAVBARS } from "@/theme/navbars";
import { FOOTERS } from "@/theme/footers";
import { HEROES } from "@/theme/heroes";
import { MediaPickerModal } from "@/components/MediaPicker";
import { saveAppearance } from "@/app/admin/settings-actions";
import type {
  SiteSettings,
  ThemeSettings,
  NavLink,
} from "@/lib/settings";

const RADIUS_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "sm", label: "Petit" },
  { value: "md", label: "Moyen" },
  { value: "lg", label: "Grand" },
  { value: "xl", label: "Tres grand" },
];

export function AppearanceForm({
  initialSite,
  initialTheme,
  initialNav,
}: {
  initialSite: SiteSettings;
  initialTheme: ThemeSettings;
  initialNav: NavLink[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [site, setSite] = useState<SiteSettings>(initialSite);
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme);
  const [nav, setNav] = useState<NavLink[]>(initialNav);
  const [showLogo, setShowLogo] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const cssVars = useMemo(
    () =>
      ({
        ...paletteToCssVars(theme.paletteId, theme.radius, theme.customColors),
        ...fontCssVars(theme.fontId),
      }) as React.CSSProperties,
    [theme],
  );
  const fontHref = fontStylesheetHref(theme.fontId);

  const Navbar = NAVBARS.find((n) => n.id === theme.navbarId)?.Component || NAVBARS[0].Component;
  const Footer = FOOTERS.find((f) => f.id === theme.footerId)?.Component || FOOTERS[0].Component;
  const Hero = HEROES.find((h) => h.id === theme.heroId)?.Component || HEROES[0].Component;

  const setT = (patch: Partial<ThemeSettings>) => setTheme((t) => ({ ...t, ...patch }));

  const save = () => {
    setMsg(null);
    start(async () => {
      await saveAppearance({ site, theme, nav });
      setMsg("Apparence enregistree et appliquee au site.");
      router.refresh();
    });
  };

  return (
    <div>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 className="admin-page-title">Apparence & Themes</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Personnalise les couleurs, la typographie et la structure du site.
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={pending}>
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {msg && (
        <div className="admin-card admin-badge-green" style={{ marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Colonne gauche: reglages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Identite du site */}
          <div className="admin-card">
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Identite du site</h2>
            <div className="admin-field">
              <label className="admin-label">Nom du site</label>
              <input className="admin-input" value={site.title} onChange={(e) => setSite({ ...site, title: e.target.value })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Description (SEO)</label>
              <textarea className="admin-textarea" style={{ minHeight: 60, fontFamily: "inherit" }} value={site.description} onChange={(e) => setSite({ ...site, description: e.target.value })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Texte du logo</label>
              <input className="admin-input" value={site.logoText} onChange={(e) => setSite({ ...site, logoText: e.target.value })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Logo (image, optionnel)</label>
              {site.logoMediaUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.logoMediaUrl} alt="logo" style={{ height: 40, marginBottom: 8 }} />
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => setShowLogo(true)}>Choisir</button>
                {site.logoMediaUrl && (
                  <button className="admin-btn admin-btn-sm" onClick={() => setSite({ ...site, logoMediaUrl: null })}>Retirer</button>
                )}
              </div>
            </div>
          </div>

          {/* Palette */}
          <div className="admin-card">
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Palette de couleurs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {PALETTES.map((p) => {
                const active = theme.paletteId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setT({ paletteId: p.id })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 8,
                      border: active ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: "#fff",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", gap: 3 }}>
                      {[p.colors.primary, p.colors.accent, p.colors.bg, p.colors.heading].map((c, i) => (
                        <span key={i} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: "1px solid rgba(0,0,0,0.1)" }} />
                      ))}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="admin-field" style={{ marginTop: 14 }}>
              <label className="admin-label">Arrondi des coins</label>
              <select className="admin-select" value={theme.radius} onChange={(e) => setT({ radius: e.target.value })}>
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Couleur principale (surcharge, optionnel)</label>
              <div className="admin-row">
                <input
                  type="color"
                  value={theme.customColors["--color-primary"] || PALETTES.find(p=>p.id===theme.paletteId)?.colors.primary || "#4f46e5"}
                  onChange={(e) => setT({ customColors: { ...theme.customColors, "--color-primary": e.target.value } })}
                  style={{ width: 44, height: 36, border: "none", background: "none" }}
                />
                {theme.customColors["--color-primary"] && (
                  <button className="admin-btn admin-btn-sm" onClick={() => { const c = { ...theme.customColors }; delete c["--color-primary"]; setT({ customColors: c }); }}>
                    Reinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Typographie */}
          <div className="admin-card">
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Typographie</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {FONT_PAIRS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setT({ fontId: f.id })}
                  style={{
                    padding: 10,
                    border: theme.fontId === f.id ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Structure */}
          <div className="admin-card">
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Structure</h2>
            <div className="admin-field">
              <label className="admin-label">Barre de navigation (10 styles)</label>
              <select className="admin-select" value={theme.navbarId} onChange={(e) => setT({ navbarId: e.target.value })}>
                {NAVBARS.map((n) => (<option key={n.id} value={n.id}>{n.name}</option>))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Pied de page (10 styles)</label>
              <select className="admin-select" value={theme.footerId} onChange={(e) => setT({ footerId: e.target.value })}>
                {FOOTERS.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Style de banniere Hero par defaut (10 styles)</label>
              <select className="admin-select" value={theme.heroId} onChange={(e) => setT({ heroId: e.target.value })}>
                {HEROES.map((h) => (<option key={h.id} value={h.id}>{h.name}</option>))}
              </select>
            </div>
          </div>

          {/* Menu de navigation */}
          <div className="admin-card">
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Menu de navigation</h2>
            {nav.map((link, i) => (
              <div key={i} className="admin-row" style={{ marginBottom: 8 }}>
                <input className="admin-input" placeholder="Libelle" value={link.label} onChange={(e) => { const n = [...nav]; n[i] = { ...n[i], label: e.target.value }; setNav(n); }} />
                <input className="admin-input" placeholder="/lien" value={link.href} onChange={(e) => { const n = [...nav]; n[i] = { ...n[i], href: e.target.value }; setNav(n); }} />
                <button className="admin-btn admin-btn-sm" onClick={() => { if (i>0){ const n=[...nav]; [n[i-1],n[i]]=[n[i],n[i-1]]; setNav(n);} }}>↑</button>
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => setNav(nav.filter((_, j) => j !== i))}>X</button>
              </div>
            ))}
            <button className="admin-btn admin-btn-sm" onClick={() => setNav([...nav, { label: "", href: "/" }])}>+ Ajouter un lien</button>
          </div>
        </div>

        {/* Colonne droite: apercu en direct */}
        <div>
          <div style={{ position: "sticky", top: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-muted)", marginBottom: 8 }}>
              Apercu en direct
            </div>
            <div
              style={{
                border: "1px solid var(--admin-border)",
                borderRadius: 12,
                overflow: "hidden",
                height: "calc(100vh - 130px)",
                overflowY: "auto",
              }}
            >
              <div style={{ ...cssVars, background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                <Navbar logoText={site.logoText} logoUrl={site.logoMediaUrl} links={nav} />
                <Hero
                  title={site.title}
                  subtitle={site.description}
                  buttonLabel="Decouvrir"
                  buttonHref="#"
                  mediaUrl=""
                />
                <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "calc(var(--radius) + 4px)", overflow: "hidden" }}>
                        <div style={{ height: 90, background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }} />
                        <div style={{ padding: 14 }}>
                          <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 16, fontWeight: 700 }}>Titre d&apos;article {i}</h3>
                          <p style={{ color: "var(--color-muted)", fontSize: 13 }}>Un court extrait de l&apos;article pour l&apos;apercu.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Footer
                  siteTitle={site.title}
                  description={site.description}
                  links={nav}
                  legalLinks={[{ label: "Confidentialite", href: "/politique-de-confidentialite" }, { label: "Mentions legales", href: "/mentions-legales" }]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        open={showLogo}
        onClose={() => setShowLogo(false)}
        onSelect={(item) => setSite({ ...site, logoMediaUrl: item.url })}
      />
    </div>
  );
}
