"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory, saveCategory } from "@/app/admin/category-actions";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
  createdAt: string;
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
};

const emptyForm = (): FormState => ({ name: "", slug: "" });

export function CategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const isEditing = Boolean(form.id);

  const resetForm = () => {
    setForm(emptyForm());
    setError(null);
  };

  const startEdit = (cat: CategoryRow) => {
    setForm({ id: cat.id, name: cat.name, slug: cat.slug });
    setError(null);
    setMsg(null);
  };

  const submit = () => {
    setError(null);
    setMsg(null);
    start(async () => {
      try {
        await saveCategory({
          id: form.id,
          name: form.name,
          slug: form.slug || undefined,
        });
        resetForm();
        setMsg(isEditing ? "Categorie mise a jour." : "Categorie creee.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  const remove = (cat: CategoryRow) => {
    const hint =
      cat.articleCount > 0
        ? ` ${cat.articleCount} article(s) seront desassocies.`
        : "";
    if (!confirm(`Supprimer la categorie « ${cat.name} » ?${hint}`)) return;

    setError(null);
    setMsg(null);
    start(async () => {
      try {
        await deleteCategory(cat.id);
        if (form.id === cat.id) resetForm();
        setMsg("Categorie supprimee.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            {initialCategories.length} categorie(s) — classe tes articles par theme.
          </p>
        </div>
      </div>

      {msg && (
        <div className="admin-card admin-badge-green" style={{ marginBottom: 16 }}>
          {msg}
        </div>
      )}
      {error && (
        <div className="admin-card" style={{ color: "#dc2626", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>
          {isEditing ? "Modifier la categorie" : "Nouvelle categorie"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Nom</label>
            <input
              className="admin-input"
              placeholder="Ex: Actualites, Tutoriels..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Slug (optionnel)</label>
            <input
              className="admin-input"
              placeholder="Genere automatiquement depuis le nom"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            className="admin-btn admin-btn-primary"
            onClick={submit}
            disabled={pending || !form.name.trim()}
          >
            {pending ? "Enregistrement..." : isEditing ? "Mettre a jour" : "Creer"}
          </button>
          {isEditing && (
            <button className="admin-btn" onClick={resetForm} disabled={pending}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {initialCategories.length === 0 ? (
        <div className="admin-card">
          <p style={{ color: "var(--admin-muted)" }}>
            Aucune categorie. Cree la premiere ci-dessus pour classer tes articles.
          </p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Slug</th>
                <th>Articles</th>
                <th>Creee le</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCategories.map((cat) => (
                <tr key={cat.id} style={form.id === cat.id ? { background: "var(--admin-bg)" } : undefined}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{cat.slug}</td>
                  <td>{cat.articleCount}</td>
                  <td style={{ fontSize: 13, color: "var(--admin-muted)" }}>
                    {new Date(cat.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => startEdit(cat)}
                        disabled={pending}
                      >
                        Editer
                      </button>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => remove(cat)}
                        disabled={pending}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
