import { prisma } from "./prisma";

export type SiteSettings = {
  title: string;
  description: string;
  logoText: string;
  logoMediaUrl: string | null;
};

export type ThemeSettings = {
  paletteId: string; // voir src/theme/palettes.ts
  navbarId: string; // voir src/theme/registry.ts
  footerId: string;
  heroId: string;
  buttonStyle: string; // solid | outline | soft | pill | ghost ...
  fontId: string; // voir src/theme/fonts.ts
  radius: string; // none | sm | md | lg | xl
  customColors: Partial<Record<string, string>>; // surcharge de variables CSS
};

export type AdsenseSettings = {
  enabled: boolean;
  clientId: string; // ex: ca-pub-XXXXXXXXXXXXXXXX
  autoAds: boolean;
  adsTxtContent: string;
};

export type AnalyticsSettings = {
  enabled: boolean;
  measurementId: string; // ex: G-XXXXXXXXXX
};

export type NavLink = { label: string; href: string };

export type AiSettings = {
  textModel: string;
  imageModel: string;
  /** Cle OpenRouter (base de donnees, configurable dans Admin > Reglages). */
  apiKey?: string;
};

export type AiSettingsPublic = Pick<AiSettings, "textModel" | "imageModel">;

export type AllSettings = {
  site: SiteSettings;
  theme: ThemeSettings;
  adsense: AdsenseSettings;
  analytics: AnalyticsSettings;
  nav: NavLink[];
  ai: AiSettings;
};

export const DEFAULT_SETTINGS: AllSettings = {
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
  adsense: {
    enabled: false,
    clientId: "",
    autoAds: false,
    adsTxtContent: "",
  },
  analytics: {
    enabled: false,
    measurementId: "",
  },
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

const KEYS: (keyof AllSettings)[] = [
  "site",
  "theme",
  "adsense",
  "analytics",
  "nav",
  "ai",
];

export async function getSetting<K extends keyof AllSettings>(
  key: K,
): Promise<AllSettings[K]> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return DEFAULT_SETTINGS[key];
  try {
    const parsed = JSON.parse(row.value);
    // fusion superficielle avec les valeurs par defaut pour resister aux ajouts de champs
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return { ...(DEFAULT_SETTINGS[key] as object), ...parsed } as AllSettings[K];
    }
    return parsed as AllSettings[K];
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

export async function setSetting<K extends keyof AllSettings>(
  key: K,
  value: AllSettings[K],
): Promise<void> {
  const serialized = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
}

export async function getAllSettings(): Promise<AllSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: KEYS as string[] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result = { ...DEFAULT_SETTINGS };
  for (const key of KEYS) {
    const raw = map.get(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        (result as Record<string, unknown>)[key] = {
          ...(DEFAULT_SETTINGS[key] as object),
          ...parsed,
        };
      } else {
        (result as Record<string, unknown>)[key] = parsed;
      }
    } catch {
      // garde la valeur par defaut
    }
  }
  return result;
}
