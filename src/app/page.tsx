import { Suspense } from "react";
import { VillaCard } from "@/components/VillaCard";
import { HomeSearchSection } from "@/components/home/HomeSearchSection";
import { PromotedRealtorCard } from "@/components/home/PromotedRealtorCard";
import { AFrameFilter } from "@/components/home/AFrameFilter";
import { getActiveCitiesWithDistricts, getActiveFacilities } from "@/lib/villa";
import { getSessionUser } from "@/lib/auth";
import { getUserFavoriteVillaIds } from "@/lib/favorites";
import {
  searchPublishedVillas,
  getPromotedVillas,
  getPromotedRealtors,
  parseVillaSearchParams,
  hasSearchFilters,
} from "@/lib/villa-search";
import { getLocale, getTranslations } from "@/i18n/server";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const filters = parseVillaSearchParams(params);
  const searchFiltering = hasSearchFilters(filters);
  const { t } = await getTranslations();
  const locale = await getLocale();

  const user = await getSessionUser();
  const favoriteIds = user ? await getUserFavoriteVillaIds(user.id) : [];
  const favoriteSet = new Set(favoriteIds);

  const [cities, facilities] = await Promise.all([
    getActiveCitiesWithDistricts(),
    getActiveFacilities(),
  ]);

  const promotedRealtors = searchFiltering ? [] : await getPromotedRealtors();
  const promotedVillas = searchFiltering ? [] : await getPromotedVillas(filters);
  const listings = await searchPublishedVillas(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-6 text-center sm:mb-8 sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mt-3 max-w-xl text-gray-500">{t("home.subtitle")}</p>
      </section>

      <Suspense fallback={null}>
        <HomeSearchSection cities={cities} facilities={facilities} />
      </Suspense>

      {filters.realtorUserId && (
        <p className="mt-6 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-900">
          {t("home.filteringByRealtor")}
        </p>
      )}

      {!searchFiltering && promotedRealtors.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("home.promotedRealtors")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t("home.promotedRealtorsHint")}</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {promotedRealtors.map((realtor) => (
              <PromotedRealtorCard
                key={realtor.id}
                userId={realtor.id}
                companyName={realtor.realtorProfile!.companyName}
                companyLogo={realtor.realtorProfile!.companyLogo}
                listingCount={realtor._count.villas}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}

      {!searchFiltering && promotedVillas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("home.promotedVillas")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t("home.promotedVillasHint")}</p>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {promotedVillas.map((villa) => (
              <VillaCard
                key={`promoted-${villa.id}`}
                villa={villa}
                locale={locale}
                isFavorited={favoriteSet.has(villa.id)}
                isLoggedIn={Boolean(user)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchFiltering || filters.aframeOnly
              ? t("home.searchResults")
              : t("home.allVillas")}
          </h2>
          {!searchFiltering && (
            <Suspense fallback={null}>
              <AFrameFilter />
            </Suspense>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-500">
              {searchFiltering || filters.aframeOnly
                ? t("home.searchEmpty")
                : t("home.empty")}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((villa) => (
              <VillaCard
                key={villa.id}
                villa={villa}
                locale={locale}
                isFavorited={favoriteSet.has(villa.id)}
                isLoggedIn={Boolean(user)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
