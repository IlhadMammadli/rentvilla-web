import { prisma } from "@/lib/prisma";
import { AdminListManager } from "@/components/admin/AdminListManager";
import { getTranslations } from "@/i18n/server";
import { requireAdminOnly } from "@/lib/admin";

export default async function AdminCitiesPage() {
  await requireAdminOnly();
  const { t } = await getTranslations();
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminListManager
      items={cities}
      apiPath="/api/admin/cities"
      title={t("admin.cities")}
      placeholder={`${t("admin.cities")}…`}
    />
  );
}
