import { getAllSettings } from "@/lib/settings";
import { AppearanceForm } from "@/components/admin/AppearanceForm";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const settings = await getAllSettings();
  return (
    <AppearanceForm
      initialSite={settings.site}
      initialTheme={settings.theme}
      initialNav={settings.nav}
    />
  );
}
