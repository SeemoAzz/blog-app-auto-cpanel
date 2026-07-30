// 10 palettes de couleurs. Chaque palette est un ensemble de variables CSS
// appliquees sur l'element racine du site public.

export type Palette = {
  id: string;
  name: string;
  dark: boolean;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    heading: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    border: string;
  };
};

export const PALETTES: Palette[] = [
  {
    id: "aurora",
    name: "Aurora (indigo)",
    dark: false,
    colors: {
      bg: "#ffffff",
      surface: "#f8fafc",
      text: "#1f2937",
      muted: "#6b7280",
      heading: "#111827",
      primary: "#4f46e5",
      primaryContrast: "#ffffff",
      accent: "#ec4899",
      border: "#e5e7eb",
    },
  },
  {
    id: "midnight",
    name: "Midnight (sombre)",
    dark: true,
    colors: {
      bg: "#0b1020",
      surface: "#131a2e",
      text: "#e2e8f0",
      muted: "#94a3b8",
      heading: "#f8fafc",
      primary: "#6366f1",
      primaryContrast: "#ffffff",
      accent: "#22d3ee",
      border: "#26314d",
    },
  },
  {
    id: "forest",
    name: "Forest (vert)",
    dark: false,
    colors: {
      bg: "#ffffff",
      surface: "#f2f8f4",
      text: "#1f2a24",
      muted: "#5f6f66",
      heading: "#14281d",
      primary: "#16a34a",
      primaryContrast: "#ffffff",
      accent: "#f59e0b",
      border: "#dbe7df",
    },
  },
  {
    id: "sunset",
    name: "Sunset (orange)",
    dark: false,
    colors: {
      bg: "#fffaf5",
      surface: "#fff1e6",
      text: "#3a2a20",
      muted: "#8a6f5f",
      heading: "#7c2d12",
      primary: "#ea580c",
      primaryContrast: "#ffffff",
      accent: "#db2777",
      border: "#f3ddca",
    },
  },
  {
    id: "ocean",
    name: "Ocean (cyan)",
    dark: false,
    colors: {
      bg: "#ffffff",
      surface: "#eff9fb",
      text: "#0f2c33",
      muted: "#5c7a82",
      heading: "#0e3a44",
      primary: "#0891b2",
      primaryContrast: "#ffffff",
      accent: "#6366f1",
      border: "#d5eaf0",
    },
  },
  {
    id: "rose",
    name: "Rose (magazine)",
    dark: false,
    colors: {
      bg: "#fffbfc",
      surface: "#fdf0f4",
      text: "#3a2530",
      muted: "#8a6b76",
      heading: "#831843",
      primary: "#e11d48",
      primaryContrast: "#ffffff",
      accent: "#7c3aed",
      border: "#f6dbe4",
    },
  },
  {
    id: "mono",
    name: "Mono (minimal N&B)",
    dark: false,
    colors: {
      bg: "#ffffff",
      surface: "#f5f5f5",
      text: "#171717",
      muted: "#737373",
      heading: "#000000",
      primary: "#171717",
      primaryContrast: "#ffffff",
      accent: "#525252",
      border: "#e5e5e5",
    },
  },
  {
    id: "slate-dark",
    name: "Slate (sombre pro)",
    dark: true,
    colors: {
      bg: "#0f172a",
      surface: "#1e293b",
      text: "#e2e8f0",
      muted: "#94a3b8",
      heading: "#ffffff",
      primary: "#38bdf8",
      primaryContrast: "#0b1220",
      accent: "#f472b6",
      border: "#334155",
    },
  },
  {
    id: "royal",
    name: "Royal (violet)",
    dark: false,
    colors: {
      bg: "#ffffff",
      surface: "#f7f5ff",
      text: "#2a2440",
      muted: "#6f6890",
      heading: "#4c1d95",
      primary: "#7c3aed",
      primaryContrast: "#ffffff",
      accent: "#f59e0b",
      border: "#e7e2f7",
    },
  },
  {
    id: "sand",
    name: "Sand (chaud/food)",
    dark: false,
    colors: {
      bg: "#fdfcf9",
      surface: "#f5efe4",
      text: "#3d3427",
      muted: "#7d7259",
      heading: "#5b4a2f",
      primary: "#b45309",
      primaryContrast: "#ffffff",
      accent: "#0d9488",
      border: "#e9e0cd",
    },
  },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "10px",
  lg: "16px",
  xl: "24px",
};

/** Genere les variables CSS a injecter au niveau racine du site public. */
export function paletteToCssVars(
  paletteId: string,
  radius: string,
  overrides: Partial<Record<string, string>> = {},
): Record<string, string> {
  const p = getPalette(paletteId);
  const vars: Record<string, string> = {
    "--color-bg": p.colors.bg,
    "--color-surface": p.colors.surface,
    "--color-text": p.colors.text,
    "--color-muted": p.colors.muted,
    "--color-heading": p.colors.heading,
    "--color-primary": p.colors.primary,
    "--color-primary-contrast": p.colors.primaryContrast,
    "--color-accent": p.colors.accent,
    "--color-border": p.colors.border,
    "--radius": RADIUS_MAP[radius] ?? RADIUS_MAP.md,
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (v) vars[k.startsWith("--") ? k : `--color-${k}`] = v;
  }
  return vars;
}
