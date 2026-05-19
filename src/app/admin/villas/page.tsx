import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/villa";

export default async function AdminVillasPage() {
  const villas = await prisma.villa.findMany({
    include: { city: true, user: { include: { villaOwnerProfile: true, realtorProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Villas</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
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
                  {formatPrice(villa.price, villa.pricePeriod)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {villa.contactName}
                  <br />
                  <span className="text-xs">{villa.contactPhone}</span>
                </td>
                <td className="px-4 py-3">
                  {villa.isPublished ? (
                    <span className="text-green-600">Live</span>
                  ) : (
                    <span className="text-gray-400">Hidden</span>
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
