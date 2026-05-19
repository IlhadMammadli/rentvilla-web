import Link from "next/link";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/villa";

export default async function DashboardPage() {
  const user = await requireOwnerOrRealtor();

  const villas = await prisma.villa.findMany({
    where: { userId: user.id },
    include: { city: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My villas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your listings — only visible when you are logged in.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add villa
        </Link>
      </div>

      {villas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">You have not listed any villas yet.</p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
          >
            Add your first villa
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {villas.map((villa) => (
            <li
              key={villa.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{villa.title}</p>
                <p className="text-sm text-gray-500">
                  {villa.city.name} · {formatPrice(villa.price, villa.pricePeriod)}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${
                  villa.isPublished ? "text-green-600" : "text-gray-400"
                }`}
              >
                {villa.isPublished ? "Published" : "Draft"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
