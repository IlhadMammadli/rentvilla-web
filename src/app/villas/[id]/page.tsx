import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, User, BedDouble, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/villa";

export default async function VillaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const villa = await prisma.villa.findUnique({
    where: { id, isPublished: true },
    include: {
      city: true,
      facilities: { include: { facility: true } },
      user: {
        include: {
          villaOwnerProfile: true,
          realtorProfile: true,
        },
      },
    },
  });

  if (!villa) notFound();

  const imageSrc =
    villa.imageUrl ??
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to villas
      </Link>

      <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image src={imageSrc} alt={villa.title} fill className="object-cover" priority />
        <span className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow">
          {formatPrice(villa.price, villa.pricePeriod)}
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-semibold text-gray-900">{villa.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            {villa.city.name}, Azerbaijan
            {villa.address && ` · ${villa.address}`}
          </p>

          <div className="mt-6 flex gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {villa.guestCount} guests
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" />
              {villa.roomCount} bedrooms
            </span>
          </div>

          {villa.facilities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Facilities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {villa.facilities.map(({ facility }) => (
                  <li
                    key={facility.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {facility.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">About this villa</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">
              {villa.description}
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <h2 className="text-lg font-medium text-gray-900">Contact host</h2>
          <p className="mt-1 text-sm text-gray-500">
            Reach out to book or ask questions about this property.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="font-medium text-gray-900">{villa.contactName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <a
                  href={`tel:${villa.contactPhone}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {villa.contactPhone}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
