"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="admin-card" style={{ width: "100%", maxWidth: 380 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        Connexion admin
      </h1>
      <p style={{ color: "var(--admin-muted)", fontSize: 14, marginBottom: 20 }}>
        Accede au tableau de bord de ton blog.
      </p>

      <input type="hidden" name="from" value={from} />

      <label className="admin-label">Email</label>
      <input
        className="admin-input"
        name="email"
        type="email"
        placeholder="admin@monblog.com"
        autoComplete="username"
        required
      />

      <label className="admin-label" style={{ marginTop: 14 }}>
        Mot de passe
      </label>
      <input
        className="admin-input"
        name="password"
        type="password"
        placeholder="********"
        autoComplete="current-password"
        required
      />

      {state.error && (
        <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>
          {state.error}
        </p>
      )}

      <button className="admin-btn admin-btn-primary" style={{ marginTop: 20, width: "100%" }} disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--admin-bg)",
        padding: 20,
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
