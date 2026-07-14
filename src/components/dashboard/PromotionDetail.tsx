"use client";

import Link from "next/link";
import { Eye, Phone, Heart, BarChart3 } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import type { PromotionStats } from "@/lib/promotion-analytics";

type PromotionDetailProps = {
  promotion: {
    id: string;
    type: string;
    tier: string;
    status: string;
    amount: number;
    startsAt: string | null;
    endsAt: string | null;
    villa: { title: string; city: { name: string } } | null;
  };
  stats: PromotionStats;
};

export function PromotionDetail({ promotion, stats }: PromotionDetailProps) {
  const t = useTranslations();

  const maxViews = Math.max(...stats.viewsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{t("promotion.details")}</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              {promotion.type === "VILLA"
                ? promotion.villa?.title ?? t("promotion.typeVilla")
                : t("promotion.typeProfile")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t(`promotion.tier.${promotion.tier}`)} · {promotion.amount} ₼ ·{" "}
              <span className="font-medium text-purple-700">{promotion.status}</span>
            </p>
            {promotion.startsAt && promotion.endsAt && (
              <p className="mt-2 text-xs text-gray-400">
                {new Date(promotion.startsAt).toLocaleDateString()} —{" "}
                {new Date(promotion.endsAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            href="/dashboard/promote"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t("promotion.promoteAgain")}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Eye className="h-5 w-5" />} label={t("dashboard.totalViews")} value={stats.totalViews} />
        <StatCard icon={<Phone className="h-5 w-5" />} label={t("dashboard.totalContacts")} value={stats.totalContacts} />
        <StatCard icon={<Heart className="h-5 w-5" />} label={t("dashboard.totalFavorites")} value={stats.totalFavorites} />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label={t("dashboard.contactRate")} value={`${stats.contactRate}%`} />
      </div>

      {stats.viewsByDay.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">{t("promotion.viewsChart")}</h3>
          <div className="mt-6 flex h-40 items-end gap-1">
            {stats.viewsByDay.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-purple-200 transition-all"
                  style={{ height: `${Math.max(4, (day.count / maxViews) * 100)}%` }}
                  title={`${day.date}: ${day.count}`}
                />
                <span className="text-[9px] text-gray-400">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.villaBreakdown.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">{t("promotion.villaBreakdown")}</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-medium">{t("dashboard.listing")}</th>
                  <th className="pb-3 font-medium">{t("dashboard.views")}</th>
                  <th className="pb-3 font-medium">{t("dashboard.contacts")}</th>
                  <th className="pb-3 font-medium">{t("dashboard.favorites")}</th>
                  <th className="pb-3 font-medium">{t("dashboard.conversion")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.villaBreakdown.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{row.title}</p>
                      <p className="text-xs text-gray-400">{row.cityName}</p>
                    </td>
                    <td className="py-3">{row.views}</td>
                    <td className="py-3">{row.contacts}</td>
                    <td className="py-3">{row.favorites}</td>
                    <td className="py-3">{row.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
