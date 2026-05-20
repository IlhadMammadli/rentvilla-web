import Link from "next/link";
import { Eye, Phone, TrendingUp, Home, BarChart3 } from "lucide-react";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getOwnerDashboardStats } from "@/lib/analytics";
import { formatPrice } from "@/lib/villa";
import { getLocale, getTranslations } from "@/i18n/server";

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-gray-600">{icon}</div>
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  villaTitle,
  metric,
  empty,
}: {
  title: string;
  villaTitle: string | null;
  metric: string;
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
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

export default async function DashboardPage() {
  const user = await requireOwnerOrRealtor();
  const stats = await getOwnerDashboardStats(user.id);
  const { t } = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("dashboard.subtitle")}</p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          {t("dashboard.addVilla")}
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
          {t("dashboard.analytics")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("dashboard.totalListings")}
            value={stats.totalListings}
            icon={<Home className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.totalViews")}
            value={stats.totalViews}
            sub={`${t("dashboard.viewsLast7Days")}: ${stats.viewsLast7}`}
            icon={<Eye className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.totalContacts")}
            value={stats.totalContacts}
            sub={`${t("dashboard.contactsLast7Days")}: ${stats.contactsLast7}`}
            icon={<Phone className="h-5 w-5" />}
          />
          <StatCard
            label={t("dashboard.contactRate")}
            value={`${stats.contactRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <HighlightCard
            title={t("dashboard.mostViewed")}
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
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("dashboard.listing")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.city")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.price")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.views")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.contacts")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.conversion")}</th>
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
    </div>
  );
}
