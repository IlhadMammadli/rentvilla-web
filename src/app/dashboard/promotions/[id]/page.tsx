import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getPromotionForUser, verifyAndActivatePromotion } from "@/lib/promotions";
import { getPromotionStats } from "@/lib/promotion-analytics";
import { PromotionDetail } from "@/components/dashboard/PromotionDetail";
import { getTranslations } from "@/i18n/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PromotionStatsPage({ params, searchParams }: PageProps) {
  const user = await requireOwnerOrRealtor();
  const { id } = await params;
  const query = await searchParams;
  const { t } = await getTranslations();

  if (query.payment === "success") {
    await verifyAndActivatePromotion(id);
  }

  const promotion = await getPromotionForUser(id, user.id);
  if (!promotion) notFound();

  const stats = await getPromotionStats(id, user.id);
  if (!stats) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← {t("dashboard.title")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">{t("promotion.statsTitle")}</h1>
        {query.payment === "success" && (
          <p className="mt-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
            {t("promotion.paymentSuccess")}
          </p>
        )}
      </div>

      <PromotionDetail
        promotion={{
          id: promotion.id,
          type: promotion.type,
          tier: promotion.tier,
          status: promotion.status,
          amount: promotion.amount,
          startsAt: promotion.startsAt?.toISOString() ?? null,
          endsAt: promotion.endsAt?.toISOString() ?? null,
          villa: promotion.villa
            ? { title: promotion.villa.title, city: { name: promotion.villa.city.name } }
            : null,
        }}
        stats={stats}
      />
    </div>
  );
}
