import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const DEFAULT_LOGO = "/logo-default.svg";

type PromotedRealtorCardProps = {
  userId: string;
  companyName: string;
  companyLogo: string | null;
  listingCount: number;
  locale: Locale;
};

export function PromotedRealtorCard({
  userId,
  companyName,
  companyLogo,
  listingCount,
  locale,
}: PromotedRealtorCardProps) {
  const m = getMessages(locale);
  const logo = companyLogo || DEFAULT_LOGO;

  return (
    <Link
      href={`/?company=${userId}`}
      className="flex min-w-[220px] shrink-0 flex-col items-center rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/80 to-white p-5 text-center transition-shadow hover:shadow-md"
    >
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
      <p className="mt-2 text-xs text-gray-500">
        {m.home.realtorListingCount.replace("{n}", String(listingCount))}
      </p>
    </Link>
  );
}
