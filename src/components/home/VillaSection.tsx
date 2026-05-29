import { VillaCard, type VillaCardData } from "@/components/VillaCard";
import type { Locale } from "@/i18n/config";

export type VillaSectionItem = VillaCardData & {
  avgRating?: number;
  reviewCount?: number;
};

type VillaSectionProps = {
  title: string;
  hint?: string;
  villas: VillaSectionItem[];
  locale: Locale;
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  emptyMessage?: string;
};

export function VillaSection({
  title,
  hint,
  villas,
  locale,
  favoriteIds,
  isLoggedIn,
  emptyMessage,
}: VillaSectionProps) {
  if (villas.length === 0 && emptyMessage) {
    return null;
  }

  if (villas.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}

      {/* Mobile: horizontal collection scroll */}
      <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {villas.map((villa) => (
          <div
            key={villa.id}
            className="w-[min(82vw,300px)] shrink-0 snap-start snap-always"
          >
            <VillaCard
              villa={villa}
              locale={locale}
              isFavorited={favoriteIds.has(villa.id)}
              isLoggedIn={isLoggedIn}
              avgRating={villa.avgRating}
              reviewCount={villa.reviewCount}
            />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="mt-6 hidden gap-8 lg:grid lg:grid-cols-3">
        {villas.map((villa) => (
          <VillaCard
            key={villa.id}
            villa={villa}
            locale={locale}
            isFavorited={favoriteIds.has(villa.id)}
            isLoggedIn={isLoggedIn}
            avgRating={villa.avgRating}
            reviewCount={villa.reviewCount}
          />
        ))}
      </div>
    </section>
  );
}
