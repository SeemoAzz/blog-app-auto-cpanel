"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteExportApiKey,
  ensureExportApiKey,
  regenerateExportApiKey,
  saveExportApiKey,
} from "@/app/admin/settings-actions";
import { formatLastSeen } from "@/lib/import-connection";

function buildPythonExample(siteUrl: string, apiKey: string): string {
  const key = apiKey.trim() || "VOTRE_CLE_API";
  return `import requests

BASE_URL = "${siteUrl}"
API_KEY = "${key}"

response = requests.get(
    f"{BASE_URL}/api/export/articles",
    headers={"Authorization": f"Bearer {API_KEY}"},
    params={"status": "published"},
    timeout=30,
)
response.raise_for_status()
data = response.json()

for article in data["articles"]:
    print(article["title"], "->", article["url"], "->", article["heroImage"])
`;
}

export function ExportApiPanel({
  apiKey,
  lastAccessAt,
}: {
  apiKey: string | null;
  lastAccessAt: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [keyInput, setKeyInput] = useState(apiKey ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<"key" | "python" | null>(null);

  useEffect(() => {
    setKeyInput(apiKey ?? "");
  }, [apiKey]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const hasKey = Boolean(apiKey?.trim());
  const lastSeen = formatLastSeen(lastAccessAt ?? undefined);
  const pythonExample = buildPythonExample(siteUrl, keyInput);

  const saveKey = () => {
    setMsg(null);
    setError(null);
    start(async () => {
      try {
        await saveExportApiKey(keyInput);
        setMsg("Cle API enregistree.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  const generateKey = () => {
    setMsg(null);
    setError(null);
    start(async () => {
      const result = await ensureExportApiKey();
      setKeyInput(result.apiKey);
      setShowKey(true);
      setMsg(
        result.created
          ? "Cle API generee. Copiez-la dans votre script Python."
          : "Cle API existante affichee ci-dessous.",
      );
      router.refresh();
    });
  };

  const regenerateKey = () => {
    if (
      !confirm(
        "Regenerer la cle API ? L'ancienne sera invalide et vos scripts devront etre mis a jour.",
      )
    ) {
      return;
    }
    setMsg(null);
    setError(null);
    start(async () => {
      const result = await regenerateExportApiKey();
      setKeyInput(result.apiKey);
      setShowKey(true);
      setMsg("Nouvelle cle API generee. Mettez a jour vos scripts.");
      router.refresh();
    });
  };

  const removeKey = () => {
    if (
      !confirm(
        "Supprimer la cle API ? L'export externe ne sera plus possible.",
      )
    ) {
      return;
    }
    setMsg(null);
    setError(null);
    start(async () => {
      await deleteExportApiKey();
      setKeyInput("");
      setShowKey(false);
      setMsg("Cle API supprimee.");
      router.refresh();
    });
  };

  const copyText = async (text: string, kind: "key" | "python") => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      setError("Impossible de copier dans le presse-papiers.");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="admin-page-title">Export d&apos;articles</h1>
        <p className="admin-page-sub" style={{ marginBottom: 0 }}>
          API en lecture seule pour recuperer les titres et images hero des
          articles publies. Une seule cle API partagee.
        </p>
      </div>

      {msg && (
        <div
          className="admin-card admin-badge-green"
          style={{ marginBottom: 16 }}
        >
          {msg}
        </div>
      )}
      {error && (
        <div
          className="admin-card admin-badge-red"
          style={{ marginBottom: 16 }}
        >
          {error}
        </div>
      )}

      {lastSeen && (
        <div className="admin-card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
            Dernier acces
          </h2>
          <p style={{ fontSize: 13, margin: 0, color: "var(--admin-muted)" }}>
            Dernier appel reussi : {lastSeen}
          </p>
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-field">
          <label className="admin-label">Cle API</label>
          <p
            style={{
              fontSize: 12,
              margin: "0 0 8px",
              color: "var(--admin-muted)",
            }}
          >
            Utilisez cette cle dans l&apos;en-tete{" "}
            <code>Authorization: Bearer ...</code>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="admin-input"
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={hasKey ? "Cle configuree" : "Aucune cle"}
              autoComplete="off"
              style={{ flex: "1 1 240px", fontFamily: "monospace", fontSize: 13 }}
            />
            <button
              type="button"
              className="admin-btn"
              onClick={() => setShowKey((v) => !v)}
              disabled={!keyInput.trim()}
            >
              {showKey ? "Masquer" : "Afficher"}
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => copyText(keyInput, "key")}
              disabled={!keyInput.trim() || pending}
            >
              {copied === "key" ? "Copie !" : "Copier"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={saveKey}
            disabled={pending || !keyInput.trim()}
          >
            {pending ? "Enregistrement..." : "Enregistrer la cle"}
          </button>
          {hasKey ? (
            <button
              type="button"
              className="admin-btn"
              onClick={regenerateKey}
              disabled={pending}
            >
              {pending ? "Generation..." : "Regenerer la cle"}
            </button>
          ) : (
            <button
              type="button"
              className="admin-btn"
              onClick={generateKey}
              disabled={pending}
            >
              {pending ? "Generation..." : "Generer une cle"}
            </button>
          )}
          {hasKey && (
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={removeKey}
              disabled={pending}
            >
              Supprimer la cle
            </button>
          )}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--admin-muted)",
            background: "var(--admin-bg)",
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <strong>Endpoint :</strong>
          <p style={{ margin: "8px 0 0" }}>
            <code>GET {siteUrl}/api/export/articles</code>
          </p>
          <p style={{ margin: "8px 0 0" }}>
            Parametres optionnels : <code>status=published</code> (defaut),{" "}
            <code>draft</code>, <code>all</code>
          </p>
          <p style={{ margin: "8px 0 0" }}>
            Header : <code>Authorization: Bearer VOTRE_CLE_API</code>
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>
            Exemple Python
          </h2>
          <button
            type="button"
            className="admin-btn"
            onClick={() => copyText(pythonExample, "python")}
            disabled={pending}
          >
            {copied === "python" ? "Copie !" : "Copier le code"}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 8,
            background: "var(--admin-bg)",
            fontSize: 12,
            lineHeight: 1.5,
            overflowX: "auto",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {pythonExample}
        </pre>
      </div>
    </div>
  );
}
