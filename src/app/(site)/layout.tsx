import Script from "next/script";
import { getAllSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { paletteToCssVars } from "@/theme/palettes";
import { fontCssVars, fontStylesheetHref } from "@/theme/fonts";
import { getNavbar } from "@/theme/navbars";
import { getFooter } from "@/theme/footers";
import { CookieConsent } from "@/components/CookieConsent";
import { ViewTracker } from "@/components/ViewTracker";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import type { NavLink } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAllSettings();
  const { site, theme, nav, adsense, analytics } = settings;

  const cssVars = {
    ...paletteToCssVars(theme.paletteId, theme.radius, theme.customColors),
    ...fontCssVars(theme.fontId),
  } as React.CSSProperties;

  const fontHref = fontStylesheetHref(theme.fontId);

  const Navbar = getNavbar(theme.navbarId).Component;
  const Footer = getFooter(theme.footerId).Component;

  // Liens legaux = pages publiees non affichees dans la nav principale
  const legalPages = await prisma.page.findMany({
    where: { status: "published", showInNav: false, isHome: false },
    orderBy: { navOrder: "asc" },
    select: { path: true, title: true },
  });
  const legalLinks: NavLink[] = legalPages.map((p) => ({
    label: p.title,
    href: p.path,
  }));

  const adsenseEnabled = adsense.enabled && adsense.clientId;
  const analyticsEnabled = analytics.enabled && analytics.measurementId;

  return (
    <div
      style={{
        ...cssVars,
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      {adsenseEnabled && (
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.clientId}`}
        />
      )}
      {adsenseEnabled && adsense.autoAds && (
        <Script id="adsbygoogle-auto" strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({ google_ad_client: "${adsense.clientId}", enable_page_level_ads: true });`}
        </Script>
      )}

      <Navbar logoText={site.logoText} logoUrl={site.logoMediaUrl} links={nav} />

      <main style={{ flex: 1 }}>{children}</main>

      <Footer
        siteTitle={site.title}
        description={site.description}
        links={nav}
        legalLinks={legalLinks}
      />

      <CookieConsent />
      <ViewTracker />
      {analyticsEnabled && (
        <GoogleAnalytics measurementId={analytics.measurementId} />
      )}
    </div>
  );
}
