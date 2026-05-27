import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

/** Where to send users after login/register (unless ?redirect= is set). */
export function defaultPathForRole(role: UserRole): string {
  if (role === "ADMIN" || role === "SITE_MANAGER") return "/admin";
  return "/";
}

export async function getUserFavoriteVillaIds(userId: string): Promise<string[]> {
  const rows = await prisma.villaFavorite.findMany({
    where: { userId },
    select: { villaId: true },
  });
  return rows.map((r) => r.villaId);
}

export async function getUserFavoriteCount(userId: string): Promise<number> {
  return prisma.villaFavorite.count({ where: { userId } });
}

export async function isVillaFavorited(userId: string, villaId: string) {
  const row = await prisma.villaFavorite.findUnique({
    where: { userId_villaId: { userId, villaId } },
  });
  return Boolean(row);
}

export async function addVillaFavorite(userId: string, villaId: string) {
  const villa = await prisma.villa.findFirst({
    where: { id: villaId, isPublished: true, user: { isBlocked: false } },
  });
  if (!villa) return { error: "Villa not found", status: 404 as const };

  await prisma.villaFavorite.upsert({
    where: { userId_villaId: { userId, villaId } },
    create: { userId, villaId },
    update: {},
  });
  return { success: true };
}

export async function removeVillaFavorite(userId: string, villaId: string) {
  await prisma.villaFavorite.deleteMany({ where: { userId, villaId } });
  return { success: true };
}

export async function getUserFavorites(userId: string) {
  return prisma.villaFavorite.findMany({
    where: { userId },
    include: {
      villa: {
        include: {
          city: true,
          district: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
