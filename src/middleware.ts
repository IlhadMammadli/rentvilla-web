import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "rentvilla_session";

async function getUserId(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(
      process.env.SESSION_SECRET ?? "rent-villa-dev-secret-change-in-production-2026"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string | null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = await getUserId(request);

  const protectedPaths = ["/dashboard", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
