"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/i18n/client";
import { AdminVillaActions } from "./AdminVillaActions";
import { formatPostNumber } from "@/lib/post-number";
import { formatPrice } from "@/lib/villa";
import type { PricePeriod } from "@prisma/client";
import type { Locale } from "@/i18n/config";

export type AdminVillaSearchResult = {
  id: string;
  postNumber: number;
  title: string;
  isPublished: boolean;
  isPromoted: boolean;
  price: number;
  pricePeriod: PricePeriod;
  city: { name: string };
  user: { email: string | null; isBlocked: boolean };
  _count: { views: number; contactReveals: number };
};

export function AdminVillaSearch({
  result,
  isAdmin,
  locale,
}: {
  result: AdminVillaSearchResult | null;
  isAdmin: boolean;
  locale: Locale;
}) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") ?? "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    const value = String(q ?? "").trim();
    if (value) router.push(`/admin/villas?q=${encodeURIComponent(value)}`);
    else router.push("/admin/villas");
  }

  return (
    <div className="mt-6 space-y-4">
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input
          name="q"
          type="search"
          defaultValue={currentQ}
          placeholder={t("admin.searchVillaPlaceholder")}
          className="min-w-[200px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {t("admin.searchVilla")}
        </button>
        {currentQ && (
          <button
            type="button"
            onClick={() => router.push("/admin/villas")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
          >
            {t("home.searchClear")}
          </button>
        )}
      </form>

      {currentQ && !result && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("admin.searchVillaNotFound")}
        </p>
      )}

      {result && (
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-800">
            {t("admin.searchResult")}
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{result.title}</p>
              <p className="mt-1 text-sm text-gray-600">
                {t("villa.postNumber")}:{" "}
                <span className="font-mono font-medium">
                  &quot;{formatPostNumber(result.postNumber)}&quot;
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {result.city.name} · {formatPrice(result.price, result.pricePeriod, locale)} ·{" "}
                {result._count.views} {t("dashboard.views").toLowerCase()}
              </p>
            </div>
            <AdminVillaActions
              villaId={result.id}
              isPublished={result.isPublished}
              isPromoted={result.isPromoted}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}
    </div>
  );
}
