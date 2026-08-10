"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteImportToken,
  ensureImportToken,
  regenerateImportToken,
  saveImportToken,
} from "@/app/admin/settings-actions";
import {
  formatLastSeen,
  type BotConnectionStatus,
} from "@/lib/import-connection";

const STATUS_LABELS: Record<BotConnectionStatus, string> = {
  no_token: "Token non configure",
  never: "News Bot jamais connecte",
  online: "News Bot en ligne",
  offline: "News Bot hors ligne",
  disconnected: "News Bot deconnecte",
};

const STATUS_HINTS: Record<BotConnectionStatus, string> = {
  no_token:
    "Generez un token ou saisissez-en un, puis collez-le dans News Bot > Connexion blog.",
  never:
    "Token configure. Dans News Bot, ouvrez Connexion blog et testez la connexion.",
  online: "News Bot a contacte ce blog recemment avec le bon token.",
  offline:
    "Aucun contact recent depuis News Bot. Verifiez que le bot tourne et que le token correspond.",
  disconnected:
    "Connexion rompue. Regenerez ou recreez un token, puis reconfigurez News Bot.",
};

export function ImportApiPanel({
  token,
  botConnectionStatus,
  lastBotSeenAt,
}: {
  token: string | null;
  botConnectionStatus: BotConnectionStatus;
  lastBotSeenAt: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [tokenInput, setTokenInput] = useState(token ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTokenInput(token ?? "");
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const hasToken = Boolean(token?.trim());
  const lastSeen = formatLastSeen(lastBotSeenAt ?? undefined);

  const saveToken = () => {
    setMsg(null);
    setError(null);
    start(async () => {
      try {
        await saveImportToken(tokenInput);
        setMsg("Token enregistre.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  const generateToken = () => {
    setMsg(null);
    setError(null);
    start(async () => {
      const result = await ensureImportToken();
      setTokenInput(result.token);
      setShowToken(true);
      setMsg(
        result.created
          ? "Token genere. Copiez-le et collez-le dans News Bot > Connexion blog."
          : "Token existant affiche ci-dessous.",
      );
      router.refresh();
    });
  };

  const regenerateToken = () => {
    if (
      !confirm(
        "Regenerer le token ? L'ancien sera invalide et News Bot devra etre reconfigure avec le nouveau.",
      )
    ) {
      return;
    }
    setMsg(null);
    setError(null);
    start(async () => {
      const result = await regenerateImportToken();
      setTokenInput(result.token);
      setShowToken(true);
      setMsg(
        "Nouveau token genere. Copiez-le et mettez a jour News Bot > Connexion blog.",
      );
      router.refresh();
    });
  };

  const removeToken = () => {
    if (
      !confirm(
        "Supprimer le token ? Toute application connectee (News Bot) sera deconnectee.",
      )
    ) {
      return;
    }
    setMsg(null);
    setError(null);
    start(async () => {
      await deleteImportToken();
      setTokenInput("");
      setShowToken(false);
      setMsg("Token supprime. Les applications liees ne peuvent plus importer.");
      router.refresh();
    });
  };

  const copyToken = async () => {
    const value = tokenInput.trim();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setError("Impossible de copier dans le presse-papiers.");
    }
  };

  const badgeClass =
    botConnectionStatus === "online"
      ? "admin-badge admin-badge-green"
      : botConnectionStatus === "offline" ||
          botConnectionStatus === "disconnected"
        ? "admin-badge admin-badge-red"
        : "admin-badge admin-badge-gray";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="admin-page-title">Import d&apos;articles</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Token partage avec News Bot. Regenerez ou supprimez-le pour changer
            d&apos;application connectee.
          </p>
        </div>
        <span className={badgeClass} style={{ marginTop: 4 }}>
          {STATUS_LABELS[botConnectionStatus]}
        </span>
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

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
          Etat de la connexion
        </h2>
        <p
          style={{
            fontSize: 13,
            margin: "0 0 8px",
            color: "var(--admin-muted)",
          }}
        >
          {STATUS_HINTS[botConnectionStatus]}
        </p>
        {lastSeen && (
          <p style={{ fontSize: 12, margin: 0, color: "var(--admin-muted)" }}>
            Dernier contact News Bot : {lastSeen}
          </p>
        )}
        {(botConnectionStatus === "online" ||
          botConnectionStatus === "offline") && (
          <p
            style={{
              fontSize: 12,
              margin: "8px 0 0",
              color: "var(--admin-muted)",
            }}
          >
            En ligne = contact dans les 3 dernieres minutes. Mise a jour
            automatique toutes les 30 s.
          </p>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-field">
          <label className="admin-label">Token d&apos;import</label>
          <p
            style={{
              fontSize: 12,
              margin: "0 0 8px",
              color: "var(--admin-muted)",
            }}
          >
            Collez le meme token dans News Bot &gt; Connexion blog. Utilisez
            &laquo;&nbsp;Regenerer&nbsp;&raquo; ou &laquo;&nbsp;Supprimer&nbsp;&raquo;
            pour deconnecter une autre instance et en connecter une nouvelle.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="admin-input"
              type={showToken ? "text" : "password"}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder={hasToken ? "Token configure" : "Aucun token"}
              autoComplete="off"
              style={{ flex: "1 1 240px", fontFamily: "monospace", fontSize: 13 }}
            />
            <button
              type="button"
              className="admin-btn"
              onClick={() => setShowToken((v) => !v)}
              disabled={!tokenInput.trim()}
            >
              {showToken ? "Masquer" : "Afficher"}
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={copyToken}
              disabled={!tokenInput.trim() || pending}
            >
              {copied ? "Copie !" : "Copier"}
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
            onClick={saveToken}
            disabled={pending || !tokenInput.trim()}
          >
            {pending ? "Enregistrement..." : "Enregistrer le token"}
          </button>
          {hasToken ? (
            <button
              type="button"
              className="admin-btn"
              onClick={regenerateToken}
              disabled={pending}
            >
              {pending ? "Generation..." : "Regenerer le token"}
            </button>
          ) : (
            <button
              type="button"
              className="admin-btn"
              onClick={generateToken}
              disabled={pending}
            >
              {pending ? "Generation..." : "Generer un token"}
            </button>
          )}
          {hasToken && (
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={removeToken}
              disabled={pending}
            >
              Supprimer le token
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
          <strong>Endpoints API :</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            <li>
              <code>GET {siteUrl}/api/import/verify</code> — tester la connexion
            </li>
            <li>
              <code>POST {siteUrl}/api/import/disconnect</code> — signaler une
              deconnexion
            </li>
            <li>
              <code>POST {siteUrl}/api/import/article</code> — importer un
              article
            </li>
          </ul>
          <p style={{ margin: "8px 0 0" }}>
            Header : <code>Authorization: Bearer VOTRE_TOKEN</code>
          </p>
        </div>
      </div>
    </div>
  );
}
