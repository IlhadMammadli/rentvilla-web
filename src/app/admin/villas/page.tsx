import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/villa";
import { getLocale, getTranslations } from "@/i18n/server";

export default async function AdminVillasPage() {
  const { t } = await getTranslations();
  const locale = await getLocale();

  const villas = await prisma.villa.findMany({
    include: { city: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{t("admin.villas")}</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("dashboard.listing")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.city")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.price")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.contact")}</th>
              <th className="px-4 py-3 font-medium">{t("dashboard.status")}</th>
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
                </td>
                <td className="px-4 py-3 text-gray-600">{villa.city.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {formatPrice(villa.price, villa.pricePeriod, locale)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {villa.contactName}
                  <br />
                  <span className="text-xs">{villa.contactPhone}</span>
                </td>
                <td className="px-4 py-3">
                  {villa.isPublished ? (
                    <span className="text-green-600">{t("common.live")}</span>
                  ) : (
                    <span className="text-gray-400">{t("common.hidden")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
