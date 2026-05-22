import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/villa";
import { getLocale, getTranslations } from "@/i18n/server";
import { requireStaff } from "@/lib/admin";
import { isAdmin } from "@/lib/permissions";
import { AdminVillaActions } from "@/components/admin/AdminVillaActions";

export default async function AdminVillasPage() {
  const user = await requireStaff();
  const { t } = await getTranslations();
  const locale = await getLocale();
  const actorIsAdmin = isAdmin(user.role);

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
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
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
            {villas.map((villa) => (
              <tr key={villa.id}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
