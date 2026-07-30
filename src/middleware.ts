import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "blog_session";

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes admin protegees (hors page de login)
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdmin && !isLogin) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await isValidSession(token);
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Deja connecte -> on evite la page de login
  if (isLogin) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (await isValidSession(token)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
