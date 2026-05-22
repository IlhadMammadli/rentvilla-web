import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "@/i18n/server";
import { requireStaff } from "@/lib/admin";
import { isAdmin } from "@/lib/permissions";

export default async function AdminOverviewPage() {
  const user = await requireStaff();
  const { t } = await getTranslations();
  const adminUser = isAdmin(user.role);

  const [users, villas, cities, facilities] = await Promise.all([
    prisma.user.count(),
    prisma.villa.count(),
    prisma.city.count({ where: { isActive: true } }),
    prisma.facility.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: t("admin.users"), value: users },
    { label: t("admin.villas"), value: villas },
    { label: t("admin.activeCities"), value: cities },
    { label: t("admin.facilities"), value: facilities },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{t("admin.overview")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("admin.overviewSubtitle")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/analytics"
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          {t("admin.viewAnalytics")}
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          {t("admin.manageUsers")}
        </Link>
        <Link
          href="/admin/villas"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          {t("admin.manageVillas")}
        </Link>
      </div>

      {adminUser && (
        <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
          <p className="font-medium">{t("admin.dbBrowser")}</p>
          <p className="mt-1 text-blue-800">{t("admin.dbBrowserHint")}</p>
        </div>
      )}
    </div>
  );
}
