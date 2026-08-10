"use client";

import { useEffect, useState } from "react";

type Category = { slug: string; name: string };

/** Champ Puck — selection d'une categorie pour filtrer la liste d'articles. */
export function CategorySelectField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      className="admin-select"
      value={value || ""}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{loading ? "Chargement..." : "Toutes les categories"}</option>
      {categories.map((c) => (
        <option key={c.slug} value={c.slug}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
