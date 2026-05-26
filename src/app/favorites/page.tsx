import { VillaCard } from "@/components/VillaCard";
import { getSessionUser } from "@/lib/auth";
import { getUserFavorites } from "@/lib/favorites";
import { getLocale, getTranslations } from "@/i18n/server";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await getSessionUser();
  const { t } = await getTranslations();
  const locale = await getLocale();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t("favorites.title")}</h1>
        <p className="mt-3 text-gray-500">{t("favorites.loginRequired")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login?redirect=/favorites"
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            {t("nav.logIn")}
          </Link>
          <Link
            href="/register?redirect=/favorites"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700"
          >
            {t("favorites.registerAsGuest")}
          </Link>
        </div>
      </div>
    );
  }

  const favorites = await getUserFavorites(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">{t("favorites.title")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("favorites.subtitle")}</p>

      {favorites.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">{t("favorites.empty")}</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline">
            {t("favorites.browseVillas")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <VillaCard
              key={f.villaId}
              villa={f.villa}
              locale={locale}
              isFavorited
              isLoggedIn
            />
          ))}
        </div>
      )}
    </div>
  );
}
