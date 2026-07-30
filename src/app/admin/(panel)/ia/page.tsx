import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { AiGenerator } from "@/components/admin/AiGenerator";

export const dynamic = "force-dynamic";

export default async function IaPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <AiGenerator
      aiConfigured={await isAiConfigured()}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
