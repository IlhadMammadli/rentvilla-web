import Link from "next/link";
import { getTranslations } from "@/i18n/server";

type PromotionRow = {
  id: string;
  type: string;
  tier: string;
  status: string;
  amount: number;
  endsAt: Date | null;
  villa: { title: string } | null;
};

type PromotionsListProps = {
  promotions: PromotionRow[];
};

export async function PromotionsList({ promotions }: PromotionsListProps) {
  const { t } = await getTranslations();

  if (promotions.length === 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{t("promotion.myPromotions")}</h2>
      <div className="mt-4 divide-y divide-gray-50">
        {promotions.slice(0, 5).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-gray-900">
                {p.type === "VILLA"
                  ? p.villa?.title ?? t("promotion.typeVilla")
                  : t("promotion.typeProfile")}
              </p>
              <p className="text-xs text-gray-500">
                {t(`promotion.tier.${p.tier}`)} · {p.amount} ₼ · {p.status}
                {p.endsAt && ` · ${t("promotion.until")} ${p.endsAt.toLocaleDateString()}`}
              </p>
            </div>
            <Link
              href={`/dashboard/promotions/${p.id}`}
              className="text-sm font-medium text-purple-700 hover:underline"
            >
              {t("promotion.viewStats")}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
