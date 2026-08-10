export type ArticlesLayout = "grid-2" | "grid-3" | "grid-4" | "list";

export type ArticlesCardStyle = "classic" | "minimal" | "overlay" | "bordered" | "accent";

export type FiltersPlacement = "top" | "sidebar-left" | "sidebar-right";

export type FiltersDirection = "row" | "column";

export type ArticlesAdFormat = "auto" | "horizontal" | "rectangle" | "vertical";

export type ArticlesPageAdSlot = {
  id: string;
  /** Insérer une pub après chaque N articles (ex: 4 → après le 4e, 8e, 12e…) */
  every: number;
  slotId: string;
  format: ArticlesAdFormat;
  label: string;
};

export type ArticlesPageConfig = {
  title: string;
  showTitle: boolean;
  layout: ArticlesLayout;
  cardStyle: ArticlesCardStyle;
  pageSize: number;
  search: {
    enabled: boolean;
    placeholder: string;
  };
  categoryFilter: {
    enabled: boolean;
    label: string;
  };
  filters: {
    placement: FiltersPlacement;
    direction: FiltersDirection;
  };
  ads: {
    enabled: boolean;
    slots: ArticlesPageAdSlot[];
  };
};

export const ARTICLES_LAYOUT_OPTIONS: { value: ArticlesLayout; label: string }[] = [
  { value: "grid-2", label: "Grille — 2 colonnes" },
  { value: "grid-3", label: "Grille — 3 colonnes" },
  { value: "grid-4", label: "Grille — 4 colonnes" },
  { value: "list", label: "Liste — lignes horizontales" },
];

export const ARTICLES_CARD_STYLE_OPTIONS: { value: ArticlesCardStyle; label: string }[] = [
  { value: "classic", label: "Classique — image en haut" },
  { value: "minimal", label: "Minimal — epure, sans bordure" },
  { value: "overlay", label: "Overlay — texte sur l'image" },
  { value: "bordered", label: "Contour — bordure accentuee" },
  { value: "accent", label: "Accent — bandeau colore" },
];

export const FILTERS_PLACEMENT_OPTIONS: { value: FiltersPlacement; label: string }[] = [
  { value: "top", label: "En haut — pleine largeur" },
  { value: "sidebar-left", label: "Barre laterale — gauche" },
  { value: "sidebar-right", label: "Barre laterale — droite" },
];

export const FILTERS_DIRECTION_OPTIONS: { value: FiltersDirection; label: string }[] = [
  { value: "row", label: "Cote a cote (ligne)" },
  { value: "column", label: "Empiles (colonne)" },
];

export const ARTICLES_AD_FORMAT_OPTIONS: { value: ArticlesAdFormat; label: string }[] = [
  { value: "auto", label: "Auto (responsive)" },
  { value: "horizontal", label: "Horizontal (banniere)" },
  { value: "rectangle", label: "Rectangle" },
  { value: "vertical", label: "Vertical" },
];

export const DEFAULT_ARTICLES_PAGE_CONFIG: ArticlesPageConfig = {
  title: "Tous les articles",
  showTitle: true,
  layout: "grid-3",
  cardStyle: "classic",
  pageSize: 10,
  search: {
    enabled: true,
    placeholder: "Rechercher un article...",
  },
  categoryFilter: {
    enabled: true,
    label: "Toutes les categories",
  },
  filters: {
    placement: "top",
    direction: "row",
  },
  ads: {
    enabled: false,
    slots: [],
  },
};

const CONFIG_MARKER = "__articlesPage";

export function parseArticlesPageConfig(puckData: string): ArticlesPageConfig {
  try {
    const parsed = JSON.parse(puckData) as {
      __type?: string;
      config?: Partial<ArticlesPageConfig>;
    };
    if (parsed?.__type === CONFIG_MARKER && parsed.config) {
      return mergeArticlesPageConfig(parsed.config);
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_ARTICLES_PAGE_CONFIG };
}

export function mergeArticlesPageConfig(
  partial: Partial<ArticlesPageConfig>,
): ArticlesPageConfig {
  return {
    ...DEFAULT_ARTICLES_PAGE_CONFIG,
    ...partial,
    search: { ...DEFAULT_ARTICLES_PAGE_CONFIG.search, ...partial.search },
    categoryFilter: {
      ...DEFAULT_ARTICLES_PAGE_CONFIG.categoryFilter,
      ...partial.categoryFilter,
    },
    filters: { ...DEFAULT_ARTICLES_PAGE_CONFIG.filters, ...partial.filters },
    ads: {
      ...DEFAULT_ARTICLES_PAGE_CONFIG.ads,
      ...partial.ads,
      slots: partial.ads?.slots ?? DEFAULT_ARTICLES_PAGE_CONFIG.ads.slots,
    },
  };
}

export function serializeArticlesPageConfig(config: ArticlesPageConfig): string {
  return JSON.stringify({ __type: CONFIG_MARKER, config });
}

export function layoutToGridClass(layout: ArticlesLayout): string {
  switch (layout) {
    case "grid-2":
      return "site-grid site-grid-2";
    case "grid-4":
      return "site-grid site-grid-4";
    case "list":
      return "articles-list";
    default:
      return "site-grid site-grid-3";
  }
}
