import Link from "next/link";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getOwnerDashboardStats } from "@/lib/analytics";
import { getLocale, getTranslations } from "@/i18n/server";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { PromotionBanner } from "@/components/dashboard/PromotionBanner";
import { PromotionsList } from "@/components/dashboard/PromotionsList";
import { getUserPromotions } from "@/lib/promotions";

export default async function DashboardPage() {
  const user = await requireOwnerOrRealtor();
  const stats = await getOwnerDashboardStats(user.id);
  const promotions = await getUserPromotions(user.id);
  const { t } = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/promote"
            className="inline-flex items-center justify-center rounded-xl border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-medium text-purple-800 hover:bg-purple-100"
          >
            {t("promotion.promoteNow")}
          </Link>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {t("dashboard.addVilla")}
          </Link>
        </div>
      </div>

      <PromotionBanner userId={user.id} />
      <PromotionsList promotions={promotions} />

      <OwnerDashboard stats={stats} locale={locale} />
    </div>
  );
}
