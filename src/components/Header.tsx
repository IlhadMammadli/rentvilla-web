"use client";

import Link from "next/link";
import { Heart, LogIn, LogOut, Plus, User, UserPlus } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type { SessionUser } from "@/lib/auth";
import { canAccessDashboard } from "@/lib/roles";
import { useTranslations } from "@/i18n/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type HeaderProps = {
  user: SessionUser | null;
  favoriteCount?: number;
  villaCount?: number;
};

/** Compact circle on mobile; expands with label from `sm`. */
function navActionClass(extra = "") {
  return `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-2 ${extra}`;
}

export function Header({ user, favoriteCount = 0, villaCount = 0 }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" variant="header" />

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
          <LanguageSwitcher />

          <Link
            href="/"
            className="hidden rounded-full px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 sm:inline-flex"
          >
            {t("nav.villas")}
          </Link>

          <Link
            href="/favorites"
            className={navActionClass("relative text-gray-600 hover:bg-gray-50 hover:text-gray-900")}
            aria-label={t("nav.favorites")}
          >
            <Heart className="h-[18px] w-[18px] sm:h-4 sm:w-4" strokeWidth={1.75} />
            <span className="hidden text-sm sm:inline">{t("nav.favorites")}</span>
            {user && favoriteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white sm:static sm:ml-0.5">
                {favoriteCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {(user.role === "ADMIN" || user.role === "SITE_MANAGER") && (
                <Link
                  href="/admin"
                  className="hidden max-w-[7rem] truncate rounded-full px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 md:inline-flex md:max-w-none"
                >
                  {user.role === "ADMIN" ? t("nav.admin") : t("nav.siteManager")}
                </Link>
              )}
              {canAccessDashboard(user.role) &&
                (villaCount > 0 ? (
                  <Link
                    href="/dashboard"
                    className="hidden rounded-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 sm:inline-flex"
                  >
                    {t("nav.dashboard")}
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/new"
                    className={navActionClass(
                      "bg-gray-900 text-white shadow-sm hover:bg-gray-800"
                    )}
                    aria-label={t("nav.addVilla")}
                  >
                    <Plus className="h-[18px] w-[18px] sm:h-4 sm:w-4" strokeWidth={2.25} />
                    <span className="hidden text-sm font-medium sm:inline">
                      {t("nav.addVilla")}
                    </span>
                  </Link>
                ))}
              <Link
                href="/profile"
                className={navActionClass("text-gray-600 hover:bg-gray-50 hover:text-gray-900")}
                aria-label={t("nav.myAccount")}
              >
                <User className="h-[18px] w-[18px] sm:h-4 sm:w-4" strokeWidth={1.75} />
                <span className="hidden max-w-[120px] truncate text-sm lg:inline">
                  {user.displayName}
                </span>
              </Link>
              <form action="/api/auth/logout" method="POST" className="shrink-0">
                <button
                  type="submit"
                  className={navActionClass(
                    "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                  aria-label={t("nav.logOut")}
                >
                  <LogOut className="h-[18px] w-[18px] sm:hidden" strokeWidth={1.75} />
                  <span className="hidden text-sm sm:inline">{t("nav.logOut")}</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={navActionClass("text-gray-600 hover:bg-gray-50 hover:text-gray-900")}
                aria-label={t("nav.logIn")}
              >
                <LogIn className="h-[18px] w-[18px] sm:hidden" strokeWidth={1.75} />
                <span className="hidden text-sm sm:inline">{t("nav.logIn")}</span>
              </Link>
              <Link
                href="/register"
                className={navActionClass("bg-gray-900 text-white shadow-sm hover:bg-gray-800")}
                aria-label={t("nav.register")}
              >
                <UserPlus className="h-[18px] w-[18px] sm:hidden" strokeWidth={1.75} />
                <span className="hidden text-sm font-medium sm:inline">{t("nav.register")}</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
