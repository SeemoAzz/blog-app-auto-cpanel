"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Non autorise");
}

function makeSlug(input: string): string {
  const s = slugify(input || "", { lower: true, strict: true, locale: "fr" });
  return s || `categorie-${Date.now().toString(36)}`;
}

async function uniqueCategorySlug(base: string, id?: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${base}-${i++}`;
  }
}

export type SaveCategoryInput = {
  id?: string;
  name: string;
  slug?: string;
};

export async function saveCategory(input: SaveCategoryInput) {
  await requireAuth();

  const name = input.name.trim();
  if (!name) throw new Error("Le nom est requis");

  const baseSlug = makeSlug(input.slug?.trim() || name);
  const slug = await uniqueCategorySlug(baseSlug, input.id);

  if (input.id) {
    await prisma.category.update({
      where: { id: input.id },
      data: { name, slug },
    });
  } else {
    await prisma.category.create({ data: { name, slug } });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  await requireAuth();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true as const };
}
