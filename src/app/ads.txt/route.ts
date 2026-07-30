import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const adsense = await getSetting("adsense");

  let content = adsense.adsTxtContent?.trim();

  if (!content && adsense.clientId) {
    // Format standard AdSense: pub-XXXX (sans le prefixe "ca-")
    const pub = adsense.clientId.replace(/^ca-/, "");
    content = `google.com, ${pub}, DIRECT, f08c47fec0942fa0`;
  }

  return new Response(content || "# ads.txt - configure ton compte AdSense dans le tableau de bord\n", {
    headers: { "Content-Type": "text/plain" },
  });
}
