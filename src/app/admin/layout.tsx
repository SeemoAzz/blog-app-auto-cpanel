import "./admin.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration - Mon Blog",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-root">{children}</div>;
}
