import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <div style={{ height: "100vh", overflow: "hidden" }}>{children}</div>;
}
