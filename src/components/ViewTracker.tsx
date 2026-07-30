"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Enregistre une vue a chaque changement de page cote client.
export function ViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Evite de compter deux fois la meme vue (ex: StrictMode en dev)
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const payload = JSON.stringify({ path: pathname });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // silencieux
    }
  }, [pathname]);

  return null;
}
