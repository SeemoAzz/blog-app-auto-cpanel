import { prisma } from "./prisma";
import {
  DEFAULT_ARTICLES_PAGE_CONFIG,
  mergeArticlesPageConfig,
  serializeArticlesPageConfig,
} from "./articles-page-config";

export const ARTICLES_PAGE_PATH = "/articles";

const CONFIG_MARKER = "__articlesPage";

function isLegacyPuckData(puckData: string): boolean {
  try {
    const parsed = JSON.parse(puckData) as { __type?: string; content?: unknown[] };
    return parsed?.__type !== CONFIG_MARKER;
  } catch {
    return true;
  }
}

export function isArticlesPage(page: { path: string; isHome?: boolean }) {
  return page.path === ARTICLES_PAGE_PATH && !page.isHome;
}

export async function getArticlesPage() {
  return prisma.page.findUnique({ where: { path: ARTICLES_PAGE_PATH } });
}

/** Cree ou migre la page /articles si necessaire. */
export async function ensureArticlesPage() {
  const existing = await getArticlesPage();
  if (existing) {
    if (isLegacyPuckData(existing.puckData)) {
      return prisma.page.update({
        where: { id: existing.id },
        data: {
          puckData: serializeArticlesPageConfig(
            mergeArticlesPageConfig({ title: existing.title || DEFAULT_ARTICLES_PAGE_CONFIG.title }),
          ),
        },
      });
    }
    return existing;
  }

  const title = DEFAULT_ARTICLES_PAGE_CONFIG.title;
  return prisma.page.create({
    data: {
      path: ARTICLES_PAGE_PATH,
      title,
      status: "published",
      showInNav: true,
      navOrder: 1,
      puckData: serializeArticlesPageConfig(DEFAULT_ARTICLES_PAGE_CONFIG),
      metaTitle: `${title} - Mon Blog`,
      metaDescription:
        "Parcourez tous les articles du blog avec recherche et filtres par categorie.",
    },
  });
}
