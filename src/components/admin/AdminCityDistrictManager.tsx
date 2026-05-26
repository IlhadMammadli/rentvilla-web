"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useTranslations } from "@/i18n/client";
export type CityWithDistrictsAdmin = {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
};

export function AdminCityDistrictManager({
  cities: initialCities,
}: {
  cities: CityWithDistrictsAdmin[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [cities, setCities] = useState(initialCities);
  const [expandedCityId, setExpandedCityId] = useState<string | null>(
    initialCities[0]?.id ?? null
  );
  const [districtName, setDistrictName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addDistrict(e: React.FormEvent) {
    e.preventDefault();
    if (!expandedCityId || !districtName.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/cities/${expandedCityId}/districts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: districtName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t("common.errorGeneric"));
      setLoading(false);
      return;
    }

    const created = await res.json();
    setCities((prev) =>
      prev.map((c) =>
        c.id === expandedCityId
          ? {
              ...c,
              districts: [...c.districts, created].sort((a, b) =>
                a.name.localeCompare(b.name)
              ),
            }
          : c
      )
    );
    setDistrictName("");
    setLoading(false);
    router.refresh();
  }

  async function removeDistrict(cityId: string, districtId: string) {
    if (!confirm(t("common.remove") + "?")) return;

    const res = await fetch(
      `/api/admin/cities/${cityId}/districts/${districtId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setCities((prev) =>
        prev.map((c) =>
          c.id === cityId
            ? { ...c, districts: c.districts.filter((d) => d.id !== districtId) }
            : c
        )
      );
      router.refresh();
    }
  }

  return (
    <div className="mt-12 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t("admin.districtsTitle")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{t("admin.districtsHint")}</p>
      </div>

      <div className="rounded-xl border border-gray-100">
        {cities.map((city) => {
          const open = expandedCityId === city.id;
          return (
            <div key={city.id} className="border-b border-gray-100 last:border-0">
              <button
                type="button"
                onClick={() => setExpandedCityId(open ? null : city.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50"
              >
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {city.name}
                  <span className="text-xs font-normal text-gray-400">
                    ({city.districts.length})
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-4">
                  <form onSubmit={addDistrict} className="flex gap-2">
                    <input
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      placeholder={t("admin.districtPlaceholder")}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                    >
                      {t("common.add")}
                    </button>
                  </form>
                  {error && expandedCityId === city.id && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                  <ul className="mt-4 space-y-1">
                    {city.districts.length === 0 ? (
                      <li className="py-2 text-sm text-gray-400">
                        {t("admin.noDistricts")}
                      </li>
                    ) : (
                      city.districts.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                        >
                          <span className="text-gray-800">{d.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDistrict(city.id, d.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            {t("common.remove")}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
