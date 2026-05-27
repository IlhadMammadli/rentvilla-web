"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { VillaSearchForm, type CityWithDistricts } from "@/components/home/VillaSearchForm";

type FacilityOption = { id: string; name: string };

type HomeSearchSectionProps = {
  cities: CityWithDistricts[];
  facilities: FacilityOption[];
};

function hasActiveSearchParams(params: URLSearchParams) {
  return Boolean(
    params.get("city") ||
      params.get("district") ||
      params.get("guests") ||
      params.get("rooms") ||
      params.get("facilities")
  );
}

export function HomeSearchSection({ cities, facilities }: HomeSearchSectionProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const filtersActive = hasActiveSearchParams(searchParams);

  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen]);

  return (
    <>
      <div className="mb-4 flex items-center justify-end lg:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          {t("home.openFilters")}
          {filtersActive && (
            <span className="flex h-2 w-2 rounded-full bg-gray-900" aria-hidden />
          )}
        </button>
      </div>

      <div className="mb-10 hidden lg:block">
        <VillaSearchForm cities={cities} facilities={facilities} />
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label={t("home.closeFilters")}
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 max-h-[90vh] overflow-y-auto rounded-b-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">{t("home.filtersTitle")}</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                aria-label={t("home.closeFilters")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <VillaSearchForm
                cities={cities}
                facilities={facilities}
                onAfterSearch={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
