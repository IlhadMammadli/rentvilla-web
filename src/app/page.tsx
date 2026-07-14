import { Suspense } from "react";
import { HomeSearchSection } from "@/components/home/HomeSearchSection";
import { VillaSection } from "@/components/home/VillaSection";
import { VillaCard } from "@/components/VillaCard";
import { PromotedRealtorCard } from "@/components/home/PromotedRealtorCard";
import { AFrameFilter } from "@/components/home/AFrameFilter";
import { getActiveCitiesWithDistricts, getActiveFacilities } from "@/lib/villa";
import { getSessionUser } from "@/lib/auth";
import { getUserFavoriteVillaIds } from "@/lib/favorites";
import {
  searchPublishedVillas,
  getPromotedVillas,
  getPromotedRealtorsWithHighlights,
  parseVillaSearchParams,
  hasSearchFilters,
} from "@/lib/villa-search";
import { getTopRatedVillas, getRatingMapForVillaIds, enrichVillasWithRatings } from "@/lib/villa-reviews";
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

  const cityName = filters.cityId
    ? cities.find((c) => c.id === filters.cityId)?.name
    : undefined;

  const promotedRealtors = searchFiltering ? [] : await getPromotedRealtorsWithHighlights();
  const promotedVillasRaw = searchFiltering ? [] : await getPromotedVillas(filters);
  const topRatedRaw = searchFiltering
    ? []
    : await getTopRatedVillas(
        filters.cityId ? { cityId: filters.cityId } : undefined,
        12
      );
  const listingsRaw = await searchPublishedVillas(filters);

  const allIds = [
    ...promotedVillasRaw.map((v) => v.id),
    ...topRatedRaw.map((v) => v.id),
    ...listingsRaw.map((v) => v.id),
  ];
  const ratingMap = await getRatingMapForVillaIds([...new Set(allIds)]);

  const promotedVillas = enrichVillasWithRatings(promotedVillasRaw, ratingMap);
  const topRatedVillas = topRatedRaw.map((v) => ({
    ...v,
    avgRating: v.avgRating,
    reviewCount: v.reviewCount,
  }));
  const listings = enrichVillasWithRatings(listingsRaw, ratingMap);

  const topRatedTitle = cityName
    ? t("home.topRatedCity", { city: cityName })
    : t("home.topRatedAll");

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
          <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {promotedRealtors.map((realtor) => (
              <div key={realtor.id} className="snap-start">
                <PromotedRealtorCard
                  userId={realtor.id}
                  companyName={realtor.realtorProfile!.companyName}
                  companyLogo={realtor.realtorProfile!.companyLogo}
                  listingCount={realtor._count.villas}
                  locale={locale}
                  highlightedVillas={realtor.villas.map((v) => ({
                    id: v.id,
                    title: v.title,
                    price: v.price,
                    pricePeriod: v.pricePeriod,
                    imageUrl: v.images[0]?.url ?? v.imageUrl,
                    cityName: v.city.name,
                  }))}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {!searchFiltering && (
        <VillaSection
          title={t("home.promotedVillas")}
          hint={t("home.promotedVillasHint")}
          villas={promotedVillas}
          locale={locale}
          favoriteIds={favoriteSet}
          isLoggedIn={Boolean(user)}
        />
      )}

      {!searchFiltering && topRatedVillas.length > 0 && (
        <VillaSection
          title={topRatedTitle}
          hint={t("home.topRatedHint")}
          villas={topRatedVillas}
          locale={locale}
          favoriteIds={favoriteSet}
          isLoggedIn={Boolean(user)}
        />
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
          <>
            <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {listings.map((villa) => (
                <div
                  key={villa.id}
                  className="w-[min(82vw,300px)] shrink-0 snap-start snap-always"
                >
                  <VillaCard
                    villa={villa}
                    locale={locale}
                    isFavorited={favoriteSet.has(villa.id)}
                    isLoggedIn={Boolean(user)}
                    avgRating={villa.avgRating}
                    reviewCount={villa.reviewCount}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 hidden gap-8 lg:grid lg:grid-cols-3">
              {listings.map((villa) => (
                <VillaCard
                  key={villa.id}
                  villa={villa}
                  locale={locale}
                  isFavorited={favoriteSet.has(villa.id)}
                  isLoggedIn={Boolean(user)}
                  avgRating={villa.avgRating}
                  reviewCount={villa.reviewCount}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
