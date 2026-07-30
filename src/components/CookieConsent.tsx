"use client";

import { useEffect, useState } from "react";

const KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      // ignore
    }
  }, []);

  const decide = (value: "accepted" | "refused") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("cookie-consent-change"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 720,
        margin: "0 auto",
        background: "var(--color-surface)",
        color: "var(--color-text)",
        border: "1px solid var(--color-border)",
        borderRadius: "calc(var(--radius) + 4px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        padding: 18,
        display: "flex",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <p style={{ flex: 1, minWidth: 240, fontSize: 14, margin: 0 }}>
        Nous utilisons des cookies pour ameliorer votre experience, mesurer
        l&apos;audience (Google Analytics) et diffuser des publicites (Google
        AdSense). En continuant, vous acceptez notre{" "}
        <a href="/politique-de-confidentialite" style={{ color: "var(--color-primary)" }}>
          politique de confidentialite
        </a>
        .
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => decide("refused")}
          style={{
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text)",
            padding: "9px 16px",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refuser
        </button>
        <button
          onClick={() => decide("accepted")}
          style={{
            border: "none",
            background: "var(--color-primary)",
            color: "var(--color-primary-contrast)",
            padding: "9px 16px",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
