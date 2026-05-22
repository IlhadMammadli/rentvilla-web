import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { getTranslations } from "@/i18n/server";

export default async function AdminAnalyticsPage() {
  await requireStaff();
  const { t } = await getTranslations();
  const data = await getAdminAnalytics();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("admin.analytics")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("admin.analyticsSubtitle")}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("admin.totalViews")} value={data.totals.views} />
        <Stat label={t("admin.totalContacts")} value={data.totals.contacts} />
        <Stat
          label={t("admin.viewsToday")}
          value={data.totals.viewsToday}
          sub={t("admin.viewsThisMonth", { n: data.totals.viewsThisMonth })}
        />
        <Stat
          label={t("admin.contactsToday")}
          value={data.totals.contactsToday}
          sub={t("admin.contactsThisMonth", { n: data.totals.contactsThisMonth })}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-900">{t("admin.trafficByDay")}</h2>
        <TrafficTable
          rows={data.traffic.viewsByDay.map((r) => ({
            period: r.date,
            views: r.count,
            contacts:
              data.traffic.contactsByDay.find((c) => c.date === r.date)?.count ?? 0,
          }))}
          t={t}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-900">{t("admin.trafficByMonth")}</h2>
        <TrafficTable
          rows={data.traffic.viewsByMonth.map((r) => ({
            period: r.month,
            views: r.count,
            contacts:
              data.traffic.contactsByMonth.find((c) => c.month === r.month)?.count ?? 0,
          }))}
          t={t}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-900">
          {t("admin.topViewedVillas")} (50)
        </h2>
        <RankingTable
          items={data.topViewedVillas.map((v) => ({
            id: v.id,
            title: v.title,
            meta: `${v.city} · ${v.ownerName}`,
            primary: v.views,
            secondary: v.contacts,
          }))}
          t={t}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-900">
          {t("admin.topContactVillas")} (50)
        </h2>
        <RankingTable
          items={data.topContactVillas.map((v) => ({
            id: v.id,
            title: v.title,
            meta: `${v.city} · ${v.ownerName}`,
            primary: v.contacts,
            secondary: v.views,
          }))}
          primaryLabel={t("dashboard.contacts")}
          secondaryLabel={t("dashboard.views")}
          t={t}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-900">
          {t("admin.topOwners")} (20)
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">{t("admin.nameCompany")}</th>
                <th className="px-4 py-3">{t("auth.email")}</th>
                <th className="px-4 py-3">{t("admin.villas")}</th>
                <th className="px-4 py-3">{t("dashboard.views")}</th>
                <th className="px-4 py-3">{t("dashboard.contacts")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.topOwners.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="px-4 py-3 text-gray-600">{o.email ?? "—"}</td>
                  <td className="px-4 py-3">{o.villaCount}</td>
                  <td className="px-4 py-3">{o.views}</td>
                  <td className="px-4 py-3">{o.contacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function TrafficTable({
  rows,
  t,
}: {
  rows: { period: string; views: number; contacts: number }[];
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-gray-50 text-gray-500">
          <tr>
            <th className="px-4 py-2">{t("admin.period")}</th>
            <th className="px-4 py-2">{t("dashboard.views")}</th>
            <th className="px-4 py-2">{t("dashboard.contacts")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                {t("dashboard.noDataYet")}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.period}>
                <td className="px-4 py-2">{r.period}</td>
                <td className="px-4 py-2">{r.views}</td>
                <td className="px-4 py-2">{r.contacts}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RankingTable({
  items,
  t,
  primaryLabel,
  secondaryLabel,
}: {
  items: {
    id: string;
    title: string;
    meta: string;
    primary: number;
    secondary: number;
  }[];
  t: (key: string) => string;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const pLabel = primaryLabel ?? t("dashboard.views");
  const sLabel = secondaryLabel ?? t("dashboard.contacts");

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">{t("dashboard.listing")}</th>
            <th className="px-4 py-3">{pLabel}</th>
            <th className="px-4 py-3">{sLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
              <td className="px-4 py-3">
                <Link href={`/villas/${item.id}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-gray-500">{item.meta}</p>
              </td>
              <td className="px-4 py-3 font-medium">{item.primary}</td>
              <td className="px-4 py-3">{item.secondary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
