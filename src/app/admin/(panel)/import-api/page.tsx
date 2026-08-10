import { getSetting } from "@/lib/settings";
import { getBotConnectionStatus } from "@/lib/import-connection";
import { ImportApiPanel } from "@/components/admin/ImportApiPanel";

export const dynamic = "force-dynamic";

export default async function ImportApiPage() {
  const importSettings = await getSetting("import");
  const token = importSettings.token?.trim() || null;

  return (
    <ImportApiPanel
      token={token}
      botConnectionStatus={getBotConnectionStatus(
        Boolean(token),
        importSettings.lastBotSeenAt,
        importSettings.botConnectionActive !== false,
      )}
      lastBotSeenAt={importSettings.lastBotSeenAt ?? null}
    />
  );
}
