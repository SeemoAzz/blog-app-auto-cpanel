import { NextResponse } from "next/server";
import { getPublicCategories } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getPublicCategories();
  return NextResponse.json(categories);
}
