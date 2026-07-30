"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    setConsented(hasConsent());

    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY) setConsented(e.newValue === "accepted");
    };

    const onConsentChange = () => setConsented(hasConsent());

    window.addEventListener("storage", onStorage);
    window.addEventListener("cookie-consent-change", onConsentChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cookie-consent-change", onConsentChange);
    };
  }, []);

  useEffect(() => {
    if (!consented || !pathname || !window.gtag) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    window.gtag("config", measurementId, { page_path: pathname });
  }, [consented, pathname, measurementId]);

  if (!consented) return null;

  return (
    <>
      <Script
        id="gtag-js"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
