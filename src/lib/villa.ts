import { prisma } from "./prisma";
import type { PricePeriod } from "@prisma/client";

export async function getPublishedVillas() {
  return prisma.villa.findMany({
    where: { isPublished: true },
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
    orderBy: { createdAt: "desc" },
  });
}

export function formatPrice(price: number, period: PricePeriod) {
  const suffix = period === "MONTHLY" ? "/month" : "/night";
  return `$${price.toLocaleString()}${suffix}`;
}

export async function getActiveCities() {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getActiveFacilities() {
  return prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
