import { prisma } from "@/lib/prisma";

export type DayBucket = { date: string; label: string; count: number };

export type TopItem = {
  refId: string;
  title: string;
  href: string;
  count: number;
};

export type ViewStats = {
  total: number;
  today: number;
  last7: number;
  last30: number;
  series: DayBucket[];
  topArticles: TopItem[];
  topPages: TopItem[];
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const DAY_LABELS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

export async function getViewStats(): Promise<ViewStats> {
  const now = new Date();
  const today = startOfDay(now);
  const last7Start = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  const last30Start = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

  const [total, todayCount, last7Count, last30Count] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    prisma.pageView.count({ where: { createdAt: { gte: last7Start } } }),
    prisma.pageView.count({ where: { createdAt: { gte: last30Start } } }),
  ]);

  // Serie journaliere sur 7 jours
  const recentViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: last7Start } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = startOfDay(new Date(last7Start.getTime() + i * 24 * 60 * 60 * 1000));
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const v of recentViews) {
    const key = startOfDay(v.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const series: DayBucket[] = Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    label: DAY_LABELS[new Date(date + "T00:00:00").getDay()],
    count,
  }));

  // Top articles / pages
  const [articleGroups, pageGroups] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["refId"],
      where: { type: "article", refId: { not: null } },
      _count: { refId: true },
      orderBy: { _count: { refId: "desc" } },
      take: 5,
    }),
    prisma.pageView.groupBy({
      by: ["refId"],
      where: { type: "page", refId: { not: null } },
      _count: { refId: true },
      orderBy: { _count: { refId: "desc" } },
      take: 5,
    }),
  ]);

  const articleIds = articleGroups.map((g) => g.refId!).filter(Boolean);
  const pageIds = pageGroups.map((g) => g.refId!).filter(Boolean);

  const [articles, pages] = await Promise.all([
    articleIds.length
      ? prisma.article.findMany({
          where: { id: { in: articleIds } },
          select: { id: true, title: true, slug: true },
        })
      : Promise.resolve([]),
    pageIds.length
      ? prisma.page.findMany({
          where: { id: { in: pageIds } },
          select: { id: true, title: true, path: true },
        })
      : Promise.resolve([]),
  ]);

  const topArticles: TopItem[] = articleGroups
    .map((g) => {
      const a = articles.find((x) => x.id === g.refId);
      if (!a) return null;
      return {
        refId: a.id,
        title: a.title,
        href: `/article/${a.slug}`,
        count: g._count.refId,
      };
    })
    .filter((x): x is TopItem => x !== null);

  const topPages: TopItem[] = pageGroups
    .map((g) => {
      const p = pages.find((x) => x.id === g.refId);
      if (!p) return null;
      return {
        refId: p.id,
        title: p.title,
        href: p.path,
        count: g._count.refId,
      };
    })
    .filter((x): x is TopItem => x !== null);

  return {
    total,
    today: todayCount,
    last7: last7Count,
    last30: last30Count,
    series,
    topArticles,
    topPages,
  };
}
