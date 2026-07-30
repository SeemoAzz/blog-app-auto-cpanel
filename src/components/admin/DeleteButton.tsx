"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticle, deletePage } from "@/app/admin/content-actions";

export function DeleteButton({
  id,
  kind,
  label = "Supprimer",
}: {
  id: string;
  kind: "article" | "page";
  label?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const onClick = () => {
    if (!confirm("Confirmer la suppression ? Cette action est irreversible.")) {
      return;
    }
    start(async () => {
      if (kind === "article") await deleteArticle(id);
      else await deletePage(id);
      router.refresh();
    });
  };

  return (
    <button
      className="admin-btn admin-btn-sm admin-btn-danger"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "..." : label}
    </button>
  );
}
