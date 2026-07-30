"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/admin");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const ok = await login(email, password);
  if (!ok) {
    return { error: "Identifiants invalides." };
  }

  redirect(from.startsWith("/admin") ? from : "/admin");
}
