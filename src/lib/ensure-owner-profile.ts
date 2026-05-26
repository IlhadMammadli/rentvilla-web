import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

/** Ensures GUEST users have a villa owner profile so they can list villas (guest ≈ villa owner). */
export async function ensureVillaOwnerProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { guestProfile: true, villaOwnerProfile: true },
  });
  if (!user) return null;

  if (user.villaOwnerProfile) return user;

  if (user.guestProfile) {
    await prisma.villaOwnerProfile.create({
      data: {
        userId,
        firstName: user.guestProfile.firstName,
        lastName: user.guestProfile.lastName,
        phone: user.guestProfile.phone,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.VILLA_OWNER },
    });
    return prisma.user.findUnique({
      where: { id: userId },
      include: { villaOwnerProfile: true, realtorProfile: true, guestProfile: true },
    });
  }

  return user;
}
