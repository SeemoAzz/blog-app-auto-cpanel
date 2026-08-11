"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { group: string; items: { href: string; label: string }[] }[] = [
  {
    group: "Contenu",
    items: [
      { href: "/admin", label: "Tableau de bord" },
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/media", label: "Mediatheque" },
    ],
  },
  {
    group: "Creation IA",
    items: [
      { href: "/admin/ia", label: "Generateur IA" },
      { href: "/admin/import-api", label: "Import d'articles" },
      { href: "/admin/export-api", label: "Export d'articles" },
    ],
  },
  {
    group: "Personnalisation",
    items: [
      { href: "/admin/apparence", label: "Apparence & Themes" },
      { href: "/admin/reglages", label: "Reglages" },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav>
      {NAV.map((section) => (
        <div key={section.group}>
          <div className="admin-nav-group">{section.group}</div>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${isActive(item.href) ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
