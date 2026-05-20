import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Users } from "lucide-react";
import { formatPrice } from "@/lib/villa";
import type { PricePeriod } from "@prisma/client";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export type VillaCardData = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  pricePeriod: PricePeriod;
  guestCount: number;
  roomCount: number;
  isPreview: boolean;
  city: { name: string };
};

export function VillaCard({
  villa,
  locale,
}: {
  villa: VillaCardData;
  locale: Locale;
}) {
  const m = getMessages(locale);
  const imageSrc =
    villa.imageUrl ??
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80";

  return (
    <Link href={`/villas/${villa.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={villa.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {villa.isPreview && (
            <span className="absolute left-3 top-3 rounded-md bg-gray-900/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {m.common.preview}
            </span>
          )}

          <span className="absolute right-3 top-3 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
            {formatPrice(villa.price, villa.pricePeriod, locale)}
          </span>
        </div>

        <div className="px-1 pt-4 pb-2">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
            {villa.title}
          </h2>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {villa.city.name}, {m.common.country}
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
        </div>
      </article>
    </Link>
  );
}
