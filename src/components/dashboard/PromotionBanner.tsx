import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getTranslations } from "@/i18n/server";
import { getUserPromotions } from "@/lib/promotions";

type PromotionBannerProps = {
  userId: string;
};

export async function PromotionBanner({ userId }: PromotionBannerProps) {
  const { t } = await getTranslations();
  const promotions = await getUserPromotions(userId);
  const activeCount = promotions.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-white px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-purple-900">{t("dashboard.promotionTitle")}</p>
          <p className="mt-1 text-sm text-purple-800/90">{t("dashboard.promotionHintPaid")}</p>
          {activeCount > 0 && (
            <p className="mt-2 text-xs font-medium text-purple-700">
              {t("promotion.activeCount", { count: String(activeCount) })}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/promote"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <Megaphone className="h-4 w-4" />
          {t("promotion.promoteNow")}
        </Link>
      </div>
    </div>
  );
}
