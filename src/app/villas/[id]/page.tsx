import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, BedDouble, Users } from "lucide-react";
import { getVillaById, formatPrice } from "@/lib/villa";
import { formatPostNumber } from "@/lib/post-number";
import { getGalleryImageUrls } from "@/lib/images";
import { getSessionUser } from "@/lib/auth";
import { isVillaFavorited } from "@/lib/favorites";
import { getLocale, getTranslations } from "@/i18n/server";
import { VillaViewTracker } from "@/components/villa/VillaViewTracker";
import { ContactRevealPanel } from "@/components/villa/ContactRevealPanel";
import { VillaImageCarousel } from "@/components/villa/VillaImageCarousel";
import { FavoriteButton } from "@/components/villa/FavoriteButton";

export default async function VillaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getTranslations();
  const locale = await getLocale();

  const villa = await getVillaById(id);
  if (!villa) notFound();

  const user = await getSessionUser();
  const favorited = user ? await isVillaFavorited(user.id, villa.id) : false;

  const images = getGalleryImageUrls(villa);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <VillaViewTracker villaId={villa.id} />

      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-900"
      >
        ← {t("villa.backToVillas")}
      </Link>

      <div className="relative">
        <VillaImageCarousel images={images} alt={villa.title} />
        <span className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow">
          {formatPrice(villa.price, villa.pricePeriod, locale)}
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold text-gray-900">{villa.title}</h1>
            <FavoriteButton
              villaId={villa.id}
              initialFavorited={favorited}
              isLoggedIn={Boolean(user)}
            />
          </div>
          {villa.isAFrame && (
            <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
              {t("villa.aframe")}
            </span>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {t("villa.postNumber")}:{" "}
            <span className="font-mono font-medium text-gray-700">
              &quot;{formatPostNumber(villa.postNumber)}&quot;
            </span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            {villa.district
              ? `${villa.district.name}, ${villa.city.name}`
              : villa.city.name}
            , {t("common.country")}
            {villa.address && ` · ${villa.address}`}
          </p>

          <div className="mt-6 flex gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {villa.guestCount} {t("common.guests")}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" />
              {villa.roomCount} {t("common.bedrooms")}
            </span>
          </div>

          {villa.facilities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">{t("villa.facilities")}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {villa.facilities.map(({ facility }) => (
                  <li
                    key={facility.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {facility.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">{t("villa.about")}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">
              {villa.description}
            </p>
          </div>
        </div>

        <ContactRevealPanel villaId={villa.id} contactName={villa.contactName} />
      </div>
    </div>
  );
}
