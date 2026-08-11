import { getSetting } from "@/lib/settings";
import { ExportApiPanel } from "@/components/admin/ExportApiPanel";

export const dynamic = "force-dynamic";

export default async function ExportApiPage() {
  const exportSettings = await getSetting("export");
  const apiKey = exportSettings.apiKey?.trim() || null;

  return (
    <ExportApiPanel
      apiKey={apiKey}
      lastAccessAt={exportSettings.lastAccessAt ?? null}
    />
  );
}
