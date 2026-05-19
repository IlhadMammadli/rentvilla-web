import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [users, villas, cities, facilities] = await Promise.all([
    prisma.user.count(),
    prisma.villa.count(),
    prisma.city.count({ where: { isActive: true } }),
    prisma.facility.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Villas", value: villas },
    { label: "Active cities", value: cities },
    { label: "Facilities", value: facilities },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <p className="mt-1 text-sm text-gray-500">
        Full admin access — manage users, listings, cities, and facilities.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
        <p className="font-medium">Database browser</p>
        <p className="mt-1 text-blue-800">
          Run <code className="rounded bg-white/60 px-1">npm run db:studio</code> in your
          terminal to open Prisma Studio — a visual editor for all tables in{" "}
          <code className="rounded bg-white/60 px-1">prisma/dev.db</code>.
        </p>
      </div>
    </div>
  );
}
