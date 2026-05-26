import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice, findAdminVillaByQuery } from "@/lib/villa";
import { formatPostNumber } from "@/lib/post-number";
import { getLocale, getTranslations } from "@/i18n/server";
import { requireStaff } from "@/lib/admin";
import { isAdmin } from "@/lib/permissions";
import { AdminVillaActions } from "@/components/admin/AdminVillaActions";
import { AdminVillaSearch } from "@/components/admin/AdminVillaSearch";

type AdminVillasPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminVillasPage({ searchParams }: AdminVillasPageProps) {
  const user = await requireStaff();
  const { t } = await getTranslations();
  const locale = await getLocale();
  const actorIsAdmin = isAdmin(user.role);
  const { q } = await searchParams;

  const searchResult = q ? await findAdminVillaByQuery(q) : null;

  const villas = await prisma.villa.findMany({
    include: {
      city: true,
      user: { select: { email: true, isBlocked: true } },
      _count: { select: { views: true, contactReveals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{t("admin.villas")}</h1>

      <Suspense fallback={null}>
        <AdminVillaSearch result={searchResult} isAdmin={actorIsAdmin} locale={locale} />
      </Suspense>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("villa.postNumber")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.listing")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.city")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.price")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.views")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.contacts")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.status")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {villas.map((villa) => {
              const highlighted =
                searchResult &&
                (searchResult.id === villa.id ||
                  searchResult.postNumber === villa.postNumber);

              return (
                <tr
                  key={villa.id}
                  id={`villa-${villa.postNumber}`}
                  className={highlighted ? "bg-purple-50/60" : ""}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {formatPostNumber(villa.postNumber)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/villas/${villa.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {villa.title}
                    </Link>
                    {villa.isPromoted && (
                      <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800">
                        {t("admin.promoted")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{villa.city.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatPrice(villa.price, villa.pricePeriod, locale)}
                  </td>
                  <td className="px-4 py-3">{villa._count.views}</td>
                  <td className="px-4 py-3">{villa._count.contactReveals}</td>
                  <td className="px-4 py-3">
                    {villa.isPublished ? (
                      <span className="text-green-600">{t("common.live")}</span>
                    ) : (
                      <span className="text-gray-400">{t("common.hidden")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <AdminVillaActions
                      villaId={villa.id}
                      isPublished={villa.isPublished}
                      isPromoted={villa.isPromoted}
                      isAdmin={actorIsAdmin}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
