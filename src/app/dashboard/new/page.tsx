import Link from "next/link";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getActiveCities, getActiveFacilities } from "@/lib/villa";
import { prisma } from "@/lib/prisma";
import { VillaUploadForm } from "@/components/villa/VillaUploadForm";

export default async function NewVillaPage() {
  const user = await requireOwnerOrRealtor();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { villaOwnerProfile: true, realtorProfile: true },
  });

  let defaultContactName = user.displayName;
  let defaultContactPhone = user.phone ?? "+994";

  if (dbUser?.villaOwnerProfile) {
    defaultContactName = `${dbUser.villaOwnerProfile.firstName} ${dbUser.villaOwnerProfile.lastName}`;
    defaultContactPhone = dbUser.villaOwnerProfile.phone;
  } else if (dbUser?.realtorProfile) {
    defaultContactName = dbUser.realtorProfile.companyName;
    defaultContactPhone = dbUser.realtorProfile.phone;
  }

  const [cities, facilities] = await Promise.all([
    getActiveCities(),
    getActiveFacilities(),
  ]);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Add new villa</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fill in the details below. Your contact info is pre-filled from registration.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <VillaUploadForm
          cities={cities}
          facilities={facilities}
          defaultContactName={defaultContactName}
          defaultContactPhone={defaultContactPhone}
        />
      </div>
    </div>
  );
}
