import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEFAULT_ARTICLES_PAGE_CONFIG,
  serializeArticlesPageConfig,
} from "../src/lib/articles-page-config";

const prisma = new PrismaClient();

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@monblog.com";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name: "Administrateur" },
    update: { passwordHash },
  });
  console.log(`Admin pret: ${email}`);

  // Reglages par defaut
  const settings: Record<string, unknown> = {
    site: {
      title: "Mon Blog",
      description:
        "Un blog moderne propulse par Next.js, editable visuellement et optimise pour le SEO.",
      logoText: "Mon Blog",
      logoMediaUrl: null,
    },
    theme: {
      paletteId: "aurora",
      navbarId: "nav-classic",
      footerId: "footer-columns",
      heroId: "hero-centered",
      buttonStyle: "solid",
      fontId: "inter-merriweather",
      radius: "md",
      customColors: {},
    },
    adsense: { enabled: false, clientId: "", autoAds: false, adsTxtContent: "" },
    nav: [
      { label: "Accueil", href: "/" },
      { label: "Articles", href: "/articles" },
      { label: "A propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
    ],
    ai: {
      textModel: "openai/gpt-4o-mini",
      imageModel: "google/gemini-2.5-flash-image",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(value) },
      update: {}, // ne pas ecraser les reglages existants
    });
  }
  console.log("Reglages par defaut prets");

  // Categorie de demo
  const cat = await prisma.category.upsert({
    where: { slug: "actualites" },
    create: { slug: "actualites", name: "Actualites" },
    update: {},
  });

  // Page d'accueil
  const homeData = {
    root: { props: { title: "Accueil" } },
    content: [
      {
        type: "Hero",
        props: {
          id: uid("Hero"),
          title: "Bienvenue sur Mon Blog",
          subtitle:
            "Un site editable visuellement, pret pour Google AdSense, avec generation d'articles par IA.",
          buttonLabel: "Lire les articles",
          buttonHref: "#articles",
          align: "center",
          mediaUrl: "",
        },
      },
      {
        type: "AdSlot",
        props: { id: uid("AdSlot"), slotId: "", format: "horizontal", label: "Publicite" },
      },
      {
        type: "ArticleList",
        props: {
          id: uid("ArticleList"),
          title: "Derniers articles",
          limit: 6,
          columns: 3,
          category: "",
        },
      },
    ],
    zones: {},
  };

  await prisma.page.upsert({
    where: { path: "/" },
    create: {
      path: "/",
      title: "Accueil",
      isHome: true,
      status: "published",
      showInNav: true,
      navOrder: 0,
      puckData: JSON.stringify(homeData),
      metaTitle: "Mon Blog - Accueil",
      metaDescription:
        "Bienvenue sur Mon Blog: actualites, guides et articles de qualite.",
    },
    update: {},
  });

  // Page liste des articles (configuration visuelle)
  const articlesTitle = DEFAULT_ARTICLES_PAGE_CONFIG.title;

  await prisma.page.upsert({
    where: { path: "/articles" },
    create: {
      path: "/articles",
      title: articlesTitle,
      status: "published",
      showInNav: true,
      navOrder: 1,
      puckData: serializeArticlesPageConfig(DEFAULT_ARTICLES_PAGE_CONFIG),
      metaTitle: `${articlesTitle} - Mon Blog`,
      metaDescription:
        "Parcourez tous les articles du blog avec recherche et filtres par categorie.",
    },
    update: {},
  });

  // Pages legales / requises AdSense
  const legalPages: {
    path: string;
    title: string;
    html: string;
    nav?: boolean;
    order?: number;
  }[] = [
    {
      path: "/a-propos",
      title: "A propos",
      nav: true,
      order: 2,
      html: "<h1>A propos</h1><p>Presentez ici votre blog, votre equipe et votre mission editoriale. Un contenu 'A propos' clair et authentique est important pour l'acceptation Google AdSense.</p>",
    },
    {
      path: "/contact",
      title: "Contact",
      nav: true,
      order: 3,
      html: "<h1>Contact</h1><p>Indiquez ici comment vous joindre: adresse e-mail, formulaire, reseaux sociaux. Une page de contact est requise par AdSense.</p>",
    },
    {
      path: "/politique-de-confidentialite",
      title: "Politique de confidentialite",
      html: "<h1>Politique de confidentialite</h1><p>Decrivez ici la maniere dont vous collectez et utilisez les donnees, l'usage des cookies (dont ceux de Google AdSense), et les droits des utilisateurs. Obligatoire pour AdSense.</p>",
    },
    {
      path: "/mentions-legales",
      title: "Mentions legales",
      html: "<h1>Mentions legales</h1><p>Informations legales sur l'editeur du site, l'hebergeur et les conditions d'utilisation.</p>",
    },
  ];

  for (const p of legalPages) {
    const data = {
      root: { props: { title: p.title } },
      content: [
        { type: "RichText", props: { id: uid("RichText"), html: p.html, align: "left", maxWidth: "prose" } },
      ],
      zones: {},
    };
    await prisma.page.upsert({
      where: { path: p.path },
      create: {
        path: p.path,
        title: p.title,
        status: "published",
        showInNav: !!p.nav,
        navOrder: p.order ?? 99,
        puckData: JSON.stringify(data),
        metaTitle: `${p.title} - Mon Blog`,
      },
      update: {},
    });
  }
  console.log("Pages creees");

  // Article d'exemple
  const articleData = {
    root: { props: { title: "Premier article" } },
    content: [
      {
        type: "Heading",
        props: { id: uid("Heading"), text: "Bienvenue dans ce premier article", level: "h1", align: "left" },
      },
      {
        type: "RichText",
        props: {
          id: uid("RichText"),
          html: "<p>Ceci est un article de demonstration. Utilisez l'editeur visuel pour glisser-deposer des blocs, ou generez un article complet avec l'IA depuis le tableau de bord.</p>",
          align: "left",
          maxWidth: "prose",
        },
      },
      {
        type: "AdSlot",
        props: { id: uid("AdSlot"), slotId: "", format: "rectangle", label: "Publicite" },
      },
      {
        type: "RichText",
        props: {
          id: uid("RichText"),
          html: "<h2>Une section</h2><p>Ajoutez du texte, des images, des boutons et des emplacements publicitaires n'importe ou sur la page.</p>",
          align: "left",
          maxWidth: "prose",
        },
      },
    ],
    zones: {},
  };

  await prisma.article.upsert({
    where: { slug: "premier-article" },
    create: {
      slug: "premier-article",
      title: "Premier article",
      excerpt:
        "Un article de demonstration pour vous montrer l'editeur visuel et les emplacements publicitaires.",
      status: "published",
      categoryId: cat.id,
      puckData: JSON.stringify(articleData),
      metaTitle: "Premier article - Mon Blog",
      metaDescription:
        "Un article de demonstration pour vous montrer l'editeur visuel.",
      publishedAt: new Date(),
    },
    update: {},
  });
  console.log("Article d'exemple cree");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
