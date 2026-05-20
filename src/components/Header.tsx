"use client";

import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { useTranslations } from "@/i18n/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type HeaderProps = {
  user: SessionUser | null;
};

export function Header({ user }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
          Rent<span className="text-gray-400">Villa</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />

          <Link
            href="/"
            className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline"
          >
            {t("nav.villas")}
          </Link>

          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t("nav.admin")}
                </Link>
              )}
              {(user.role === "VILLA_OWNER" || user.role === "REALTOR") && (
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t("nav.dashboard")}
                </Link>
              )}
              <span className="hidden max-w-[120px] truncate text-sm text-gray-500 sm:inline">
                {user.displayName}
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  {t("nav.logOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
