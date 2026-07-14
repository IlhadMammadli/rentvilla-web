import Link from "next/link";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getTranslations } from "@/i18n/server";
import { PromoteForm } from "@/components/dashboard/PromoteForm";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export default async function PromotePage() {
  const user = await requireOwnerOrRealtor();
  const { t } = await getTranslations();
  const isRealtor = user.role === UserRole.REALTOR;

  const villas = await prisma.villa.findMany({
    where: { userId: user.id, isPublished: true },
    include: {
      city: { select: { name: true } },
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const villaOptions = villas.map((v) => ({
    id: v.id,
    title: v.title,
    cityName: v.city.name,
    imageUrl: v.images[0]?.url ?? v.imageUrl,
    promotedUntil: v.promotedUntil?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← {t("common.back")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">{t("promotion.pageTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("promotion.pageSubtitle")}</p>
      </div>

      <PromoteForm villas={villaOptions} isRealtor={isRealtor} />
    </div>
  );
}
