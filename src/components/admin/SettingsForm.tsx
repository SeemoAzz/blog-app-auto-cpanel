"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAdsense, saveAi, saveAnalytics } from "@/app/admin/settings-actions";
import type { AdsenseSettings, AiSettingsPublic, AnalyticsSettings } from "@/lib/settings";

export function SettingsForm({
  initialAdsense,
  initialAnalytics,
  initialAi,
  aiKeyPresent,
}: {
  initialAdsense: AdsenseSettings;
  initialAnalytics: AnalyticsSettings;
  initialAi: AiSettingsPublic;
  aiKeyPresent: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adsense, setAdsense] = useState<AdsenseSettings>(initialAdsense);
  const [analytics, setAnalytics] = useState<AnalyticsSettings>(initialAnalytics);
  const [ai, setAi] = useState<AiSettingsPublic>(initialAi);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const saveAll = () => {
    setMsg(null);
    start(async () => {
      await Promise.all([
        saveAdsense(adsense),
        saveAnalytics(analytics),
        saveAi({ ...ai, apiKey: apiKeyInput || undefined }),
      ]);
      setApiKeyInput("");
      setMsg("Reglages enregistres.");
      router.refresh();
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 className="admin-page-title">Reglages</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Configure Google Analytics, AdSense et l&apos;IA.
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={saveAll} disabled={pending}>
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {msg && <div className="admin-card admin-badge-green" style={{ marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Google Analytics */}
        <div className="admin-card">
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Google Analytics</h2>

          <div className="admin-field">
            <label className="admin-row" style={{ gap: 8 }}>
              <input
                type="checkbox"
                checked={analytics.enabled}
                onChange={(e) => setAnalytics({ ...analytics, enabled: e.target.checked })}
              />
              <span>Activer Google Analytics (injecte le script sur le site)</span>
            </label>
          </div>

          <div className="admin-field">
            <label className="admin-label">ID de mesure (Measurement ID)</label>
            <input
              className="admin-input"
              placeholder="G-XXXXXXXXXX"
              value={analytics.measurementId}
              onChange={(e) =>
                setAnalytics({ ...analytics, measurementId: e.target.value.trim() })
              }
            />
            <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
              Visible dans Google Analytics &gt; Admin &gt; Flux de donnees &gt; Details du flux
              web (format G-...).
            </p>
          </div>

          <div style={{ fontSize: 13, color: "var(--admin-muted)", background: "var(--admin-bg)", padding: 12, borderRadius: 8 }}>
            Le script n&apos;est charge qu&apos;apres acceptation des cookies par le visiteur.
            Consulte les statistiques detaillees sur{" "}
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
              analytics.google.com
            </a>
            .
          </div>
        </div>

        {/* AdSense */}
        <div className="admin-card">
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Google AdSense</h2>

          <div className="admin-field">
            <label className="admin-row" style={{ gap: 8 }}>
              <input type="checkbox" checked={adsense.enabled} onChange={(e) => setAdsense({ ...adsense, enabled: e.target.checked })} />
              <span>Activer AdSense (injecte le script sur le site)</span>
            </label>
          </div>

          <div className="admin-field">
            <label className="admin-label">Identifiant editeur (client ID)</label>
            <input
              className="admin-input"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={adsense.clientId}
              onChange={(e) => setAdsense({ ...adsense, clientId: e.target.value.trim() })}
            />
            <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
              Visible dans ton compte AdSense (format ca-pub-...).
            </p>
          </div>

          <div className="admin-field">
            <label className="admin-row" style={{ gap: 8 }}>
              <input type="checkbox" checked={adsense.autoAds} onChange={(e) => setAdsense({ ...adsense, autoAds: e.target.checked })} />
              <span>Activer les annonces automatiques (Auto Ads)</span>
            </label>
          </div>

          <div className="admin-field">
            <label className="admin-label">Contenu personnalise de ads.txt (optionnel)</label>
            <textarea
              className="admin-textarea"
              placeholder="Laisse vide pour generer automatiquement depuis le client ID"
              value={adsense.adsTxtContent}
              onChange={(e) => setAdsense({ ...adsense, adsTxtContent: e.target.value })}
            />
            <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
              Accessible sur <code>/ads.txt</code>.
            </p>
          </div>

          <div style={{ fontSize: 13, color: "var(--admin-muted)", background: "var(--admin-bg)", padding: 12, borderRadius: 8 }}>
            Pour placer une publicite a un endroit precis: ajoute un bloc
            &laquo; Publicite (AdSense) &raquo; dans l&apos;editeur de page ou
            d&apos;article, et renseigne l&apos;ID d&apos;emplacement.
          </div>
        </div>

        {/* IA */}
        <div className="admin-card" style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Intelligence artificielle (OpenRouter)</h2>

          <div
            className="admin-field"
            style={{ background: aiKeyPresent ? "#dcfce7" : "#fef3c7", padding: 10, borderRadius: 8 }}
          >
            <strong style={{ fontSize: 13 }}>
              {aiKeyPresent
                ? "Cle API OpenRouter detectee."
                : "Cle API absente."}
            </strong>
            <p style={{ fontSize: 12, margin: "4px 0 0" }}>
              Saisis ta cle ci-dessous. Elle n&apos;est jamais exposee au
              navigateur apres enregistrement.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="admin-field">
              <label className="admin-label">Cle API OpenRouter</label>
              <input
                type="password"
                className="admin-input"
                placeholder={aiKeyPresent ? "Cle enregistree — laisse vide pour conserver" : "sk-or-v1-..."}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                autoComplete="off"
              />
              <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
                Obtiens une cle sur{" "}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                  openrouter.ai/keys
                </a>
                .
              </p>
            </div>

            <div className="admin-field">
              <label className="admin-label">Modele de texte</label>
              <input
                className="admin-input"
                placeholder="openai/gpt-4o-mini"
                value={ai.textModel}
                onChange={(e) => setAi({ ...ai, textModel: e.target.value.trim() })}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Modele d&apos;image</label>
              <input
                className="admin-input"
                placeholder="google/gemini-2.5-flash-image"
                value={ai.imageModel}
                onChange={(e) => setAi({ ...ai, imageModel: e.target.value.trim() })}
              />
              <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
                Choisis un modele compatible images sur openrouter.ai/models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
