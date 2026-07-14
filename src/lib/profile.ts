import { prisma } from "./prisma";
import { hashPassword, normalizePhone, verifyPassword } from "./auth";
import type { UserRole } from "@prisma/client";

export type UserProfile = {
  id: string;
  role: UserRole;
  email: string | null;
  phone: string | null;
  displayName: string;
};

function buildDisplayName(user: {
  email: string | null;
  villaOwnerProfile: { firstName: string; lastName: string } | null;
  realtorProfile: { companyName: string } | null;
  guestProfile: { firstName: string; lastName: string } | null;
}) {
  if (user.villaOwnerProfile) {
    return `${user.villaOwnerProfile.firstName} ${user.villaOwnerProfile.lastName}`;
  }
  if (user.realtorProfile) {
    return user.realtorProfile.companyName;
  }
  if (user.guestProfile) {
    return `${user.guestProfile.firstName} ${user.guestProfile.lastName}`;
  }
  if (user.email) {
    return user.email.split("@")[0];
  }
  return "User";
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      villaOwnerProfile: true,
      realtorProfile: true,
      guestProfile: true,
    },
  });

  if (!user || user.isBlocked) return null;

  return {
    id: user.id,
    role: user.role,
    email: user.email,
    phone:
      user.phone ??
      user.villaOwnerProfile?.phone ??
      user.realtorProfile?.phone ??
      user.guestProfile?.phone ??
      null,
    displayName: buildDisplayName(user),
  };
}

export async function updateUserContact(
  userId: string,
  input: { email: string; phone: string; currentPassword: string }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      villaOwnerProfile: true,
      realtorProfile: true,
      guestProfile: true,
    },
  });

  if (!user || user.isBlocked) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const validPassword = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!validPassword) {
    return { error: "Current password is incorrect", status: 400 as const };
  }

  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);

  if (phone.length < 12) {
    return { error: "Valid phone number is required", status: 400 as const };
  }

  const conflict = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      OR: [{ email }, { phone }],
    },
    select: { email: true, phone: true },
  });

  if (conflict) {
    if (conflict.email === email) {
      return { error: "Email is already in use", status: 400 as const };
    }
    return { error: "Phone number is already in use", status: 400 as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { email, phone },
    });

    if (user.villaOwnerProfile) {
      await tx.villaOwnerProfile.update({
        where: { userId },
        data: { phone },
      });
    } else if (user.realtorProfile) {
      await tx.realtorProfile.update({
        where: { userId },
        data: { phone },
      });
    } else if (user.guestProfile) {
      await tx.guestProfile.update({
        where: { userId },
        data: { phone },
      });
    }
  });

  return { success: true as const };
}

export async function changeUserPassword(
  userId: string,
  input: { currentPassword: string; newPassword: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.isBlocked) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const validPassword = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!validPassword) {
    return { error: "Current password is incorrect", status: 400 as const };
  }

  if (input.currentPassword === input.newPassword) {
    return { error: "New password must be different from current password", status: 400 as const };
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true as const };
}
