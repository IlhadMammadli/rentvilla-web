import Link from "next/link";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getOwnerDashboardStats } from "@/lib/analytics";
import { getLocale, getTranslations } from "@/i18n/server";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { PromotionBanner } from "@/components/dashboard/PromotionBanner";
import { UserRole } from "@prisma/client";

export default async function DashboardPage() {
  const user = await requireOwnerOrRealtor();
  const isRealtor = user.role === UserRole.REALTOR;
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

      {isRealtor && <PromotionBanner />}

      <OwnerDashboard stats={stats} locale={locale} />
    </div>
  );
}
