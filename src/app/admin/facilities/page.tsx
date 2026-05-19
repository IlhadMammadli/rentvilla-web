import { prisma } from "@/lib/prisma";
import { AdminListManager } from "@/components/admin/AdminListManager";

export default async function AdminFacilitiesPage() {
  const facilities = await prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminListManager
      items={facilities}
      apiPath="/api/admin/facilities"
      title="Facilities"
      placeholder="e.g. Swimming pool"
    />
  );
}
