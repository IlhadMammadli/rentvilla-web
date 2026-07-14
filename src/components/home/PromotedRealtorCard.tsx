import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { SITE_LOGO_PATH } from "@/lib/constants";
import { formatPrice } from "@/lib/villa";
import { resolveImageUrl } from "@/lib/images";
import type { PricePeriod } from "@prisma/client";

const DEFAULT_LOGO = SITE_LOGO_PATH;

export type HighlightedVilla = {
  id: string;
  title: string;
  price: number;
  pricePeriod: PricePeriod;
  imageUrl: string | null;
  cityName: string;
};

type PromotedRealtorCardProps = {
  userId: string;
  companyName: string;
  companyLogo: string | null;
  listingCount: number;
  locale: Locale;
  highlightedVillas?: HighlightedVilla[];
};

export function PromotedRealtorCard({
  userId,
  companyName,
  companyLogo,
  listingCount,
  locale,
  highlightedVillas = [],
}: PromotedRealtorCardProps) {
  const m = getMessages(locale);
  const logo = companyLogo || DEFAULT_LOGO;

  return (
    <div className="flex min-w-[min(82vw,320px)] shrink-0 flex-col rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/80 to-white p-5 shadow-sm">
      <Link href={`/?company=${userId}`} className="flex flex-col items-center text-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
          {companyLogo ? (
            <Image src={logo} alt={companyName} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              <Building2 className="h-8 w-8" />
            </div>
          )}
        </div>
        <p className="mt-3 font-semibold text-gray-900">{companyName}</p>
        <p className="mt-1 text-xs text-purple-700">{m.home.promotedRealtorBadge}</p>
        <p className="mt-1 text-xs text-gray-500">
          {m.home.realtorListingCount.replace("{n}", String(listingCount))}
        </p>
      </Link>

      {highlightedVillas.length > 0 && (
        <div className="mt-4 border-t border-purple-100 pt-4">
          <p className="mb-2 text-center text-xs font-medium text-purple-800">
            {m.home.highlightedVillas}
          </p>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {highlightedVillas.map((villa) => (
              <Link
                key={villa.id}
                href={`/villas/${villa.id}`}
                className="w-[100px] shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-16 w-full bg-gray-100">
                  <Image
                    src={resolveImageUrl(villa.imageUrl ?? "")}
                    alt={villa.title}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-gray-900">{villa.title}</p>
                  <p className="text-[10px] text-gray-500">{villa.cityName}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-purple-700">
                    {formatPrice(villa.price, villa.pricePeriod, locale)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
