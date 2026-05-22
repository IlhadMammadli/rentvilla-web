import { prisma } from "@/lib/prisma";
import { AdminListManager } from "@/components/admin/AdminListManager";
import { getTranslations } from "@/i18n/server";
import { requireAdminOnly } from "@/lib/admin";

export default async function AdminFacilitiesPage() {
  await requireAdminOnly();
  const { t } = await getTranslations();
  const facilities = await prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminListManager
      items={facilities}
      apiPath="/api/admin/facilities"
      title={t("admin.facilities")}
      placeholder={`${t("admin.facilities")}…`}
    />
  );
}
