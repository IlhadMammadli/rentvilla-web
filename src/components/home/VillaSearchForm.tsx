"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { FilterCombobox } from "@/components/ui/FilterCombobox";
import { FilterMultiCombobox } from "@/components/ui/FilterMultiCombobox";

export type CityWithDistricts = {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
};

type FacilityOption = { id: string; name: string };

export function VillaSearchForm({
  cities,
  facilities,
}: {
  cities: CityWithDistricts[];
  facilities: FacilityOption[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCity = searchParams.get("city") ?? "";
  const initialDistrict = searchParams.get("district") ?? "";
  const initialFacilities = (searchParams.get("facilities") ?? "")
    .split(",")
    .filter(Boolean);

  const [cityId, setCityId] = useState(initialCity);
  const [districtId, setDistrictId] = useState(initialDistrict);
  const [guests, setGuests] = useState(searchParams.get("guests") ?? "");
  const [rooms, setRooms] = useState(searchParams.get("rooms") ?? "");
  const [facilityIds, setFacilityIds] = useState<string[]>(initialFacilities);

  const selectedCity = cities.find((c) => c.id === cityId);
  const districtOptions = useMemo(
    () =>
      (selectedCity?.districts ?? []).map((d) => ({
        value: d.id,
        label: d.name,
      })),
    [selectedCity]
  );

  const cityOptions = useMemo(
    () => [
      { value: "", label: t("home.searchAllCities") },
      ...cities.map((c) => ({ value: c.id, label: c.name })),
    ],
    [cities, t]
  );

  const facilityOptions = useMemo(
    () => facilities.map((f) => ({ value: f.id, label: f.name })),
    [facilities]
  );

  function handleCityChange(nextCityId: string) {
    setCityId(nextCityId);
    const city = cities.find((c) => c.id === nextCityId);
    const districtStillValid = city?.districts.some((d) => d.id === districtId);
    if (!districtStillValid) setDistrictId("");
  }

  function applySearch() {
    const params = new URLSearchParams();
    if (cityId) params.set("city", cityId);
    if (districtId) params.set("district", districtId);
    if (guests) params.set("guests", guests);
    if (rooms) params.set("rooms", rooms);
    if (facilityIds.length) params.set("facilities", facilityIds.join(","));

    const company = searchParams.get("company");
    const aframe = searchParams.get("aframe");
    if (company) params.set("company", company);
    if (aframe) params.set("aframe", aframe);

    router.push(params.toString() ? `/?${params}` : "/");
  }

  function clearSearch() {
    setCityId("");
    setDistrictId("");
    setGuests("");
    setRooms("");
    setFacilityIds([]);
    const company = searchParams.get("company");
    const aframe = searchParams.get("aframe");
    const parts = new URLSearchParams();
    if (company) parts.set("company", company);
    if (aframe) parts.set("aframe", aframe);
    router.push(parts.toString() ? `/?${parts}` : "/");
  }

  const hasFilters =
    cityId ||
    districtId ||
    guests ||
    rooms ||
    facilityIds.length > 0 ||
    searchParams.get("city") ||
    searchParams.get("district") ||
    searchParams.get("guests") ||
    searchParams.get("rooms") ||
    searchParams.get("facilities");

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-lg shadow-gray-200/40 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <FilterCombobox
          label={t("home.searchCity")}
          placeholder={t("home.searchCityPlaceholder")}
          searchPlaceholder={t("home.searchTypeToFilter")}
          options={cityOptions}
          value={cityId}
          onChange={handleCityChange}
          emptyMessage={t("home.searchNoResults")}
        />

        {cityId && districtOptions.length > 0 && (
          <FilterCombobox
            label={t("home.searchDistrict")}
            placeholder={t("home.searchDistrictPlaceholder")}
            searchPlaceholder={t("home.searchTypeToFilter")}
            options={[
              { value: "", label: t("home.searchAllDistricts") },
              ...districtOptions,
            ]}
            value={districtId}
            onChange={setDistrictId}
            emptyMessage={t("home.searchNoResults")}
          />
        )}

        <div className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
            {t("home.searchGuests")}
          </span>
          <input
            type="number"
            name="guests"
            min={1}
            placeholder="4+"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
            {t("home.searchRooms")}
          </span>
          <input
            type="number"
            name="rooms"
            min={1}
            placeholder="3+"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <FilterMultiCombobox
          label={t("home.searchFacilities")}
          placeholder={t("home.searchFacilitiesPlaceholder")}
          searchPlaceholder={t("home.searchTypeToFilter")}
          options={facilityOptions}
          values={facilityIds}
          onChange={setFacilityIds}
          emptyMessage={t("home.searchNoResults")}
        />

        <div className="flex shrink-0 gap-2 lg:flex-col lg:pb-0.5 xl:flex-row">
          <button
            type="button"
            onClick={applySearch}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 lg:flex-none"
          >
            <Search className="h-4 w-4" />
            {t("home.searchSubmit")}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 lg:flex-none"
            >
              {t("home.searchClear")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
