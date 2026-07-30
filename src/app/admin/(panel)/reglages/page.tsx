import { getSetting } from "@/lib/settings";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function ReglagesPage() {
  const [adsense, ai, analytics] = await Promise.all([
    getSetting("adsense"),
    getSetting("ai"),
    getSetting("analytics"),
  ]);

  return (
    <SettingsForm
      initialAdsense={adsense}
      initialAnalytics={analytics}
      initialAi={{ textModel: ai.textModel, imageModel: ai.imageModel }}
      aiKeyPresent={await isAiConfigured()}
    />
  );
}
