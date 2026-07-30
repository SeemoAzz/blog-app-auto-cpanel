import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <CategoryManager
      initialCategories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        articleCount: c._count.articles,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
