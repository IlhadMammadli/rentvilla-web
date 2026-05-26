import { getTranslations } from "@/i18n/server";

export async function PromotionBanner() {
  const { t } = await getTranslations();

  return (
    <div className="mb-8 rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 px-5 py-4">
      <p className="font-medium text-purple-900">{t("dashboard.promotionTitle")}</p>
      <p className="mt-1 text-sm text-purple-800/90">{t("dashboard.promotionHint")}</p>
    </div>
  );
}
