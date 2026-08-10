import type { Config, Data } from "@puckeditor/core";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ArticleCard } from "@/components/site/ArticleCard";
import { ARTICLES_CARD_STYLE_OPTIONS } from "@/lib/articles-page-config";
import type { ArticlesCardStyle, ArticlesLayout } from "@/lib/articles-page-config";
import { MediaField } from "./MediaField";
import { CategorySelectField } from "./CategorySelectField";
import { getHero, HERO_OPTIONS } from "@/theme/heroes";

export type ArticleCardData = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

export type PuckMeta = {
  adsenseClientId?: string;
  articles?: ArticleCardData[];
};

const ALIGN_OPTIONS = [
  { label: "Gauche", value: "left" },
  { label: "Centre", value: "center" },
  { label: "Droite", value: "right" },
];

const mediaField = {
  type: "custom" as const,
  label: "Image",
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <MediaField value={value} onChange={onChange} />
  ),
};

function buttonStyle(style: string, size: string): React.CSSProperties {
  const paddings: Record<string, string> = {
    sm: "8px 14px",
    md: "11px 20px",
    lg: "14px 28px",
  };
  const base: React.CSSProperties = {
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 600,
    padding: paddings[size] || paddings.md,
    borderRadius: style === "pill" ? "999px" : "var(--radius)",
    cursor: "pointer",
    border: "1px solid transparent",
  };
  switch (style) {
    case "outline":
      return { ...base, background: "transparent", color: "var(--color-primary)", borderColor: "var(--color-primary)" };
    case "soft":
      return { ...base, background: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)" };
    case "ghost":
      return { ...base, background: "transparent", color: "var(--color-primary)" };
    case "pill":
    case "solid":
    default:
      return { ...base, background: "var(--color-primary)", color: "var(--color-primary-contrast)" };
  }
}

const maxWidthMap: Record<string, string> = {
  prose: "720px",
  wide: "960px",
  full: "100%",
};

export const config: Config = {
  categories: {
    Mise_en_page: {
      title: "Mise en page",
      components: ["Hero", "Section", "Columns", "Spacer", "Divider"],
    },
    Contenu: {
      title: "Contenu",
      components: ["Heading", "RichText", "Image", "Button", "Card"],
    },
    Dynamique: {
      title: "Dynamique",
      components: ["ArticleList", "AdSlot", "HtmlEmbed"],
    },
    Article: {
      title: "Article (pagination)",
      components: ["ArticlePartBreak"],
    },
  },
  root: {
    fields: {
      title: { type: "text", label: "Titre (interne)" },
    },
    render: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  },
  components: {
    Hero: {
      label: "Hero (banniere)",
      fields: {
        variantId: { type: "select", label: "Style", options: HERO_OPTIONS },
        title: { type: "text", label: "Titre" },
        subtitle: { type: "textarea", label: "Sous-titre" },
        buttonLabel: { type: "text", label: "Texte du bouton" },
        buttonHref: { type: "text", label: "Lien du bouton" },
        media: mediaField,
      },
      defaultProps: {
        variantId: "hero-centered",
        title: "Un titre accrocheur",
        subtitle: "Une phrase d'introduction qui donne envie de lire.",
        buttonLabel: "Decouvrir",
        buttonHref: "#",
        media: "",
      },
      render: ({ variantId, title, subtitle, buttonLabel, buttonHref, media }) => {
        const Hero = getHero(variantId).Component;
        return (
          <Hero
            title={title}
            subtitle={subtitle}
            buttonLabel={buttonLabel}
            buttonHref={buttonHref}
            mediaUrl={media}
          />
        );
      },
    },

    Heading: {
      label: "Titre",
      fields: {
        text: { type: "text", label: "Texte" },
        level: {
          type: "select",
          label: "Niveau",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        align: { type: "radio", label: "Alignement", options: ALIGN_OPTIONS },
      },
      defaultProps: { text: "Nouveau titre", level: "h2", align: "left" },
      render: ({ text, level, align }) => {
        const Tag = (level || "h2") as "h1" | "h2" | "h3" | "h4";
        const sizes: Record<string, number> = { h1: 40, h2: 30, h3: 24, h4: 20 };
        return (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
            <Tag
              className="site-puck-heading"
              style={{
                textAlign: align,
                fontFamily: "var(--font-heading)",
                color: "var(--color-heading)",
                fontWeight: 800,
                fontSize: sizes[level] || 30,
                margin: "18px 0 10px",
                lineHeight: 1.2,
              }}
            >
              {text}
            </Tag>
          </div>
        );
      },
    },

    RichText: {
      label: "Texte enrichi (HTML)",
      fields: {
        html: { type: "textarea", label: "Contenu HTML" },
        align: { type: "radio", label: "Alignement", options: ALIGN_OPTIONS },
        maxWidth: {
          type: "select",
          label: "Largeur",
          options: [
            { label: "Lecture (720px)", value: "prose" },
            { label: "Large (960px)", value: "wide" },
            { label: "Pleine", value: "full" },
          ],
        },
      },
      defaultProps: {
        html: "<p>Ecris ton texte ici. Tu peux utiliser du HTML: <strong>gras</strong>, <em>italique</em>, listes, liens...</p>",
        align: "left",
        maxWidth: "prose",
      },
      render: ({ html, align, maxWidth }) => (
        <div
          className="rich-text"
          style={{
            maxWidth: maxWidthMap[maxWidth] || maxWidthMap.prose,
            margin: "0 auto",
            padding: "0 20px",
            textAlign: align,
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      ),
    },

    Image: {
      label: "Image",
      fields: {
        media: mediaField,
        alt: { type: "text", label: "Texte alternatif (SEO)" },
        caption: { type: "text", label: "Legende" },
        width: {
          type: "select",
          label: "Largeur",
          options: [
            { label: "Petite (400px)", value: "400px" },
            { label: "Moyenne (600px)", value: "600px" },
            { label: "Grande (860px)", value: "860px" },
            { label: "Pleine", value: "100%" },
          ],
        },
        rounded: {
          type: "radio",
          label: "Coins",
          options: [
            { label: "Droits", value: "0" },
            { label: "Arrondis", value: "var(--radius)" },
          ],
        },
        align: { type: "radio", label: "Alignement", options: ALIGN_OPTIONS },
      },
      defaultProps: {
        media: "",
        alt: "",
        caption: "",
        width: "860px",
        rounded: "var(--radius)",
        align: "center",
      },
      render: ({ media, alt, caption, width, rounded, align }) => {
        const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
        return (
          <figure style={{ margin: "18px auto", padding: "0 20px", maxWidth: 1000, display: "flex", flexDirection: "column", alignItems: justify }}>
            {media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media} alt={alt || ""} style={{ width, maxWidth: "100%", borderRadius: rounded, display: "block" }} />
            ) : (
              <div style={{ width, maxWidth: "100%", aspectRatio: "16/9", background: "var(--color-surface)", border: "1px dashed var(--color-border)", borderRadius: rounded, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-muted)" }}>
                Choisir une image
              </div>
            )}
            {caption && (
              <figcaption style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 6, textAlign: "center" }}>
                {caption}
              </figcaption>
            )}
          </figure>
        );
      },
    },

    Button: {
      label: "Bouton",
      fields: {
        label: { type: "text", label: "Texte" },
        href: { type: "text", label: "Lien" },
        style: {
          type: "select",
          label: "Style",
          options: [
            { label: "Plein", value: "solid" },
            { label: "Contour", value: "outline" },
            { label: "Doux", value: "soft" },
            { label: "Pilule", value: "pill" },
            { label: "Fantome", value: "ghost" },
          ],
        },
        size: {
          type: "select",
          label: "Taille",
          options: [
            { label: "Petit", value: "sm" },
            { label: "Moyen", value: "md" },
            { label: "Grand", value: "lg" },
          ],
        },
        align: { type: "radio", label: "Alignement", options: ALIGN_OPTIONS },
      },
      defaultProps: { label: "Cliquez ici", href: "#", style: "solid", size: "md", align: "left" },
      render: ({ label, href, style, size, align }) => (
        <div style={{ padding: "10px 20px", textAlign: align, maxWidth: 960, margin: "0 auto" }}>
          <Link href={href || "#"} style={buttonStyle(style, size)}>
            {label}
          </Link>
        </div>
      ),
    },

    AdSlot: {
      label: "Publicite (AdSense)",
      fields: {
        format: {
          type: "select",
          label: "Format",
          options: [
            { label: "Auto (responsive)", value: "auto" },
            { label: "Horizontal (banniere)", value: "horizontal" },
            { label: "Rectangle", value: "rectangle" },
            { label: "Vertical", value: "vertical" },
          ],
        },
        slotId: { type: "text", label: "ID d'emplacement (data-ad-slot)" },
        label: { type: "text", label: "Etiquette affichee" },
      },
      defaultProps: { format: "auto", slotId: "", label: "Publicite" },
      render: ({ format, slotId, label, puck }) => {
        const meta = (puck?.metadata || {}) as PuckMeta;
        return (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
            <AdSlot
              clientId={meta.adsenseClientId}
              slotId={slotId}
              format={format}
              label={label}
              preview={Boolean(puck?.isEditing)}
            />
          </div>
        );
      },
    },

    ArticlePartBreak: {
      label: "Fin de partie (pagination)",
      fields: {
        nextButtonLabel: { type: "text", label: "Texte du bouton Suivant" },
        prevButtonLabel: { type: "text", label: "Texte du bouton Retour" },
        showAdBeforeNext: {
          type: "select",
          label: "Publicite avant la partie suivante",
          options: [
            { label: "Oui — afficher une pub a fermer", value: "yes" },
            { label: "Non — passage direct", value: "no" },
          ],
        },
        adFormat: {
          type: "select",
          label: "Format de la pub interstitielle",
          options: [
            { label: "Auto (responsive)", value: "auto" },
            { label: "Horizontal (banniere)", value: "horizontal" },
            { label: "Rectangle", value: "rectangle" },
            { label: "Vertical", value: "vertical" },
          ],
        },
        adSlotId: { type: "text", label: "ID emplacement pub (data-ad-slot)" },
        adLabel: { type: "text", label: "Etiquette pub interstitielle" },
      },
      defaultProps: {
        nextButtonLabel: "Partie suivante",
        prevButtonLabel: "Partie precedente",
        showAdBeforeNext: "yes",
        adFormat: "rectangle",
        adSlotId: "",
        adLabel: "Publicite",
      },
      render: ({ nextButtonLabel, prevButtonLabel, showAdBeforeNext, adFormat, puck }) => {
        if (!puck?.isEditing) return <></>;
        const withAd = showAdBeforeNext !== "no";

        return (
          <div
            style={{
              maxWidth: 720,
              margin: "24px auto",
              padding: "20px",
              border: "2px dashed var(--color-primary)",
              borderRadius: "calc(var(--radius) + 4px)",
              background: "color-mix(in srgb, var(--color-primary) 6%, transparent)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--color-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Fin de partie — pagination
            </div>
            <p style={{ margin: "0 0 6px", color: "var(--color-heading)", fontWeight: 600 }}>
              Suivant : &laquo; {nextButtonLabel || "Partie suivante"} &raquo;
              {" · "}
              Retour : &laquo; {prevButtonLabel || "Partie precedente"} &raquo;
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-muted)" }}>
              {withAd
                ? `Pub interstitielle (${adFormat}) affichee avant la suite — le lecteur doit la fermer.`
                : "Passage direct a la partie suivante, sans pub."}
            </p>
          </div>
        );
      },
    },

    Section: {
      label: "Section (conteneur)",
      fields: {
        background: {
          type: "select",
          label: "Fond",
          options: [
            { label: "Aucun", value: "transparent" },
            { label: "Surface", value: "var(--color-surface)" },
            { label: "Primaire", value: "var(--color-primary)" },
            { label: "Accent", value: "var(--color-accent)" },
          ],
        },
        paddingY: {
          type: "select",
          label: "Espacement vertical",
          options: [
            { label: "Petit", value: "24px" },
            { label: "Moyen", value: "48px" },
            { label: "Grand", value: "80px" },
          ],
        },
        content: { type: "slot" },
      },
      defaultProps: { background: "transparent", paddingY: "48px" },
      render: ({ background, paddingY, content: Content }) => (
        <section style={{ background, padding: `${paddingY} 0` }}>
          <Content />
        </section>
      ),
    },

    Columns: {
      label: "Colonnes",
      fields: {
        columns: {
          type: "select",
          label: "Nombre de colonnes",
          options: [
            { label: "2 colonnes", value: 2 },
            { label: "3 colonnes", value: 3 },
            { label: "4 colonnes", value: 4 },
          ],
        },
        gap: { type: "number", label: "Espacement (px)" },
        items: { type: "slot" },
      },
      defaultProps: { columns: 2, gap: 20 },
      render: ({ columns, gap, items: Items }) => (
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px" }}>
          <Items
            className={`site-grid site-grid-${columns || 2}`}
            style={{
              gap: gap || 20,
            }}
          />
        </div>
      ),
    },

    Card: {
      label: "Carte",
      fields: {
        media: mediaField,
        title: { type: "text", label: "Titre" },
        text: { type: "textarea", label: "Texte" },
        href: { type: "text", label: "Lien (optionnel)" },
        buttonLabel: { type: "text", label: "Texte du bouton (optionnel)" },
      },
      defaultProps: { media: "", title: "Titre de la carte", text: "Description courte.", href: "", buttonLabel: "" },
      render: ({ media, title, text, href, buttonLabel }) => (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "calc(var(--radius) + 4px)", overflow: "hidden", height: "100%" }}>
          {media && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt={title || ""} style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} />
          )}
          <div style={{ padding: 18 }}>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.6 }}>{text}</p>
            {href && buttonLabel && (
              <Link href={href} style={{ ...buttonStyle("soft", "sm"), marginTop: 12 }}>
                {buttonLabel}
              </Link>
            )}
          </div>
        </div>
      ),
    },

    ArticleList: {
      label: "Liste d'articles",
      fields: {
        title: { type: "text", label: "Titre de la section" },
        limit: { type: "number", label: "Nombre d'articles" },
        columns: {
          type: "select",
          label: "Colonnes",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
          ],
        },
        cardStyle: {
          type: "select",
          label: "Style des cartes",
          options: ARTICLES_CARD_STYLE_OPTIONS.map((o) => ({
            label: o.label,
            value: o.value,
          })),
        },
        category: {
          type: "custom",
          label: "Categorie",
          render: ({ value, onChange }) => (
            <CategorySelectField value={value || ""} onChange={onChange} />
          ),
        },
      },
      defaultProps: {
        title: "Derniers articles",
        limit: 6,
        columns: 3,
        cardStyle: "classic",
        category: "",
      },
      render: ({ title, limit, columns, cardStyle, category, puck }) => {
        const meta = (puck?.metadata || {}) as PuckMeta;
        const all = meta.articles || [];
        const filtered = category ? all.filter((a) => a.categorySlug === category) : all;
        const items = filtered.slice(0, limit || 6);
        const layout: ArticlesLayout =
          columns === 2 ? "grid-2" : columns === 4 ? "grid-4" : "grid-3";
        const style = (cardStyle || "classic") as ArticlesCardStyle;

        return (
          <section id="articles" style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
            {title && (
              <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
                {title}
              </h2>
            )}
            {items.length === 0 ? (
              <p style={{ color: "var(--color-muted)" }}>
                {puck?.isEditing
                  ? category
                    ? "Aucun article publie dans cette categorie."
                    : "Les articles publies apparaitront ici sur le site."
                  : "Aucun article pour le moment."}
              </p>
            ) : (
              <div className={`site-grid site-grid-${columns || 3}`} style={{ gap: 20 }}>
                {items.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    article={a}
                    cardStyle={style}
                    layout={layout}
                  />
                ))}
              </div>
            )}
          </section>
        );
      },
    },

    Spacer: {
      label: "Espace",
      fields: {
        size: {
          type: "select",
          label: "Hauteur",
          options: [
            { label: "Petit (24px)", value: "24px" },
            { label: "Moyen (48px)", value: "48px" },
            { label: "Grand (80px)", value: "80px" },
            { label: "Tres grand (120px)", value: "120px" },
          ],
        },
      },
      defaultProps: { size: "48px" },
      render: ({ size }) => <div style={{ height: size }} />,
    },

    Divider: {
      label: "Separateur",
      fields: {},
      render: () => (
        <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 20px" }}>
          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />
        </div>
      ),
    },

    HtmlEmbed: {
      label: "Code / Embed (HTML)",
      fields: {
        html: { type: "textarea", label: "Code HTML / iframe / script" },
        fullWidth: {
          type: "radio",
          label: "Largeur",
          options: [
            { label: "Contenu", value: "prose" },
            { label: "Pleine", value: "full" },
          ],
        },
      },
      defaultProps: {
        html: "<!-- Colle ici ton code HTML, une iframe, un embed... -->",
        fullWidth: "prose",
      },
      render: ({ html, fullWidth }) => (
        <div
          style={{
            maxWidth: fullWidth === "full" ? "100%" : 860,
            margin: "16px auto",
            padding: "0 20px",
          }}
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      ),
    },
  },
};

export function emptyData(title = "Nouvelle page"): Data {
  return {
    root: { props: { title } },
    content: [],
    zones: {},
  } as Data;
}
