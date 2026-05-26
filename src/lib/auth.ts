import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

const COOKIE_NAME = "rentvilla_session";

export type SessionUser = {
  id: string;
  role: UserRole;
  email: string | null;
  phone: string | null;
  displayName: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId as string;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        villaOwnerProfile: true,
        realtorProfile: true,
        guestProfile: true,
      },
    });

    if (!user || user.isBlocked) return null;

    let displayName = "User";
    if (user.villaOwnerProfile) {
      displayName = `${user.villaOwnerProfile.firstName} ${user.villaOwnerProfile.lastName}`;
    } else if (user.realtorProfile) {
      displayName = user.realtorProfile.companyName;
    } else if (user.guestProfile) {
      displayName = `${user.guestProfile.firstName} ${user.guestProfile.lastName}`;
    } else if (user.email) {
      displayName = user.email.split("@")[0];
    }

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
      displayName,
    };
  } catch {
    return null;
  }
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("994")) return `+${digits}`;
  if (digits.startsWith("0")) return `+994${digits.slice(1)}`;
  if (digits.length === 9) return `+994${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}
