"use client";

import Link from "next/link";
import { Eye, Phone, TrendingUp, Home, BarChart3 } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { LabelWithInfo } from "@/components/dashboard/DashboardLabels";
import { formatPrice } from "@/lib/villa";
import type { Locale } from "@/i18n/config";
import type { PricePeriod } from "@prisma/client";

export type DashboardStats = {
  totalListings: number;
  totalViews: number;
  totalContacts: number;
  contactRate: number;
  viewsLast7: number;
  contactsLast7: number;
  mostViewed: { title: string; views: number } | null;
  mostContacted: { title: string; contacts: number } | null;
  topPerformer: { title: string; views: number; conversion: number } | null;
  villas: {
    id: string;
    title: string;
    cityName: string;
    price: number;
    pricePeriod: PricePeriod;
    isPublished: boolean;
    views: number;
    contacts: number;
    conversion: number;
  }[];
};

function StatCard({
  label,
  info,
  value,
  sub,
  icon,
}: {
  label: string;
  info: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">
            <LabelWithInfo label={label} info={info} />
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="shrink-0 rounded-lg bg-gray-50 p-2 text-gray-600">{icon}</div>
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  info,
  villaTitle,
  metric,
  empty,
}: {
  title: string;
  info: string;
  villaTitle: string | null;
  metric: string;
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        <LabelWithInfo label={title} info={info} className="uppercase" />
      </p>
      {villaTitle ? (
        <>
          <p className="mt-2 font-medium text-gray-900 line-clamp-2">{villaTitle}</p>
          <p className="mt-1 text-sm text-gray-500">{metric}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-gray-400">{empty}</p>
      )}
    </div>
  );
}

export function OwnerDashboard({
  stats,
  locale,
}: {
  stats: DashboardStats;
  locale: Locale;
}) {
  const t = useTranslations();

  return (
    <>
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
          {t("dashboard.analytics")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("dashboard.totalListings")}
            info={t("dashboard.infoTotalListings")}
            value={stats.totalListings}
            icon={<Home className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.totalViews")}
            info={t("dashboard.infoTotalViews")}
            value={stats.totalViews}
            sub={`${t("dashboard.viewsLast7Days")}: ${stats.viewsLast7}`}
            icon={<Eye className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.totalContacts")}
            info={t("dashboard.infoTotalContacts")}
            value={stats.totalContacts}
            sub={`${t("dashboard.contactsLast7Days")}: ${stats.contactsLast7}`}
            icon={<Phone className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.contactRate")}
            info={t("dashboard.infoContactRate")}
            value={`${stats.contactRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <HighlightCard
            title={t("dashboard.mostViewed")}
            info={t("dashboard.infoMostViewed")}
            villaTitle={stats.mostViewed?.title ?? null}
            metric={
              stats.mostViewed
                ? `${stats.mostViewed.views} ${t("dashboard.views")}`
                : ""
            }
            empty={t("dashboard.noDataYet")}
          />
          <HighlightCard
            title={t("dashboard.mostContacted")}
            info={t("dashboard.infoMostContacted")}
            villaTitle={stats.mostContacted?.title ?? null}
            metric={
              stats.mostContacted
                ? `${stats.mostContacted.contacts} ${t("dashboard.contacts")}`
                : ""
            }
            empty={t("dashboard.noDataYet")}
          />
          <HighlightCard
            title={t("dashboard.topPerformer")}
            info={t("dashboard.infoTopPerformer")}
            villaTitle={stats.topPerformer?.title ?? null}
            metric={
              stats.topPerformer
                ? `${stats.topPerformer.views} ${t("dashboard.views")} · ${stats.topPerformer.conversion}% ${t("dashboard.conversion")}`
                : ""
            }
            empty={t("dashboard.noDataYet")}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
          <BarChart3 className="h-5 w-5 text-gray-400" />
          {t("dashboard.myListings")}
        </h2>

        {stats.villas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-500">{t("dashboard.emptyListings")}</p>
            <Link
              href="/dashboard/new"
              className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
            >
              {t("dashboard.addFirst")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("dashboard.listing")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.city")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.price")}</th>
                  <th className="px-4 py-3 font-medium">
                    <LabelWithInfo
                      label={t("dashboard.views")}
                      info={t("dashboard.infoTableViews")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <LabelWithInfo
                      label={t("dashboard.contacts")}
                      info={t("dashboard.infoTableContacts")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <LabelWithInfo
                      label={t("dashboard.conversion")}
                      info={t("dashboard.infoTableConversion")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.status")}</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.villas.map((villa) => (
                  <tr key={villa.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-gray-900">{villa.title}</td>
                    <td className="px-4 py-3 text-gray-600">{villa.cityName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatPrice(villa.price, villa.pricePeriod, locale)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{villa.views}</td>
                    <td className="px-4 py-3 text-gray-900">{villa.contacts}</td>
                    <td className="px-4 py-3 text-gray-600">{villa.conversion}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          villa.isPublished ? "text-green-600" : "text-gray-400"
                        }
                      >
                        {villa.isPublished ? t("common.live") : t("common.hidden")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/villas/${villa.id}`}
                        className="text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        {t("dashboard.viewListing")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
