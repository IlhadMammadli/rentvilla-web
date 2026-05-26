"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { canAccessDashboard } from "@/lib/roles";
import { useTranslations } from "@/i18n/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type HeaderProps = {
  user: SessionUser | null;
  favoriteCount?: number;
  villaCount?: number;
};

export function Header({ user, favoriteCount = 0, villaCount = 0 }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
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

          <Link
            href="/favorites"
            className="relative inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.favorites")}</span>
            {user && favoriteCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {favoriteCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {(user.role === "ADMIN" || user.role === "SITE_MANAGER") && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {user.role === "ADMIN" ? t("nav.admin") : t("nav.siteManager")}
                </Link>
              )}
              {canAccessDashboard(user.role) &&
                (villaCount > 0 ? (
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {t("nav.dashboard")}
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/new"
                    className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    {t("nav.addVilla")}
                  </Link>
                ))}
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
