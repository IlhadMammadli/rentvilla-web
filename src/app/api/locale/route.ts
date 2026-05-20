import { NextRequest, NextResponse } from "next/server";
import { isValidLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const locale = body.locale;

  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
