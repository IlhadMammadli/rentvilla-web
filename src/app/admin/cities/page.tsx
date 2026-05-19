import { prisma } from "@/lib/prisma";
import { AdminListManager } from "@/components/admin/AdminListManager";

export default async function AdminCitiesPage() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminListManager
      items={cities}
      apiPath="/api/admin/cities"
      title="Cities"
      placeholder="New city name…"
    />
  );
}
