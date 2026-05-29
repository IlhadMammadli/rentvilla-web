import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Star, Users } from "lucide-react";
import { formatPrice } from "@/lib/villa";
import { getMainImageUrl, type VillaWithImages } from "@/lib/images";
import { FavoriteButton } from "@/components/villa/FavoriteButton";
import type { PricePeriod } from "@prisma/client";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export type VillaCardData = VillaWithImages & {
  id: string;
  title: string;
  price: number;
  pricePeriod: PricePeriod;
  guestCount: number;
  roomCount: number;
  isPreview: boolean;
  isPromoted?: boolean;
  isAFrame?: boolean;
  city: { name: string };
  district?: { name: string } | null;
};

export function VillaCard({
  villa,
  locale,
  isFavorited = false,
  isLoggedIn = false,
  avgRating = 0,
  reviewCount = 0,
}: {
  villa: VillaCardData;
  locale: Locale;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
  avgRating?: number;
  reviewCount?: number;
}) {
  const m = getMessages(locale);
  const imageSrc = getMainImageUrl(villa);

  return (
    <article className="group overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Link href={`/villas/${villa.id}`} className="block h-full">
          <Image
            src={imageSrc}
            alt={villa.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {reviewCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {avgRating.toFixed(1)}
            <span className="text-gray-500">({reviewCount})</span>
          </div>
        )}

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {villa.isPromoted && (
            <span className="rounded-md bg-gray-900/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {m.villa.promoted}
            </span>
          )}
          {villa.isPreview && (
            <span className="rounded-md bg-gray-900/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {m.common.preview}
            </span>
          )}
          {villa.isAFrame && (
            <span className="rounded-md bg-amber-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {m.villa.aframe}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-start gap-2">
          <FavoriteButton
            villaId={villa.id}
            initialFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
            size="sm"
          />
          <span className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
            {formatPrice(villa.price, villa.pricePeriod, locale)}
          </span>
        </div>
      </div>

      <Link href={`/villas/${villa.id}`} className="block px-1 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
          {villa.title}
        </h2>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {villa.district
            ? `${villa.district.name}, ${villa.city.name}`
            : villa.city.name}
          , {m.common.country}
        </p>

        <div className="mt-3 flex items-center gap-5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            {villa.guestCount} {m.common.guests}
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4" strokeWidth={1.5} />
            {villa.roomCount} {m.common.bedrooms}
          </span>
        </div>
      </Link>
    </article>
  );
}
