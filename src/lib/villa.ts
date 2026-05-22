import { prisma } from "./prisma";
import type { PricePeriod } from "@prisma/client";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const villaInclude = {
  city: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  facilities: { include: { facility: true } },
  user: {
    include: {
      villaOwnerProfile: true,
      realtorProfile: true,
    },
  },
};

export async function getPublishedVillas() {
  return prisma.villa.findMany({
    where: {
      isPublished: true,
      user: { isBlocked: false },
    },
    include: villaInclude,
    orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
  });
}

export async function getVillaById(id: string) {
  return prisma.villa.findUnique({
    where: { id, isPublished: true },
    include: {
      city: true,
      images: { orderBy: { sortOrder: "asc" } },
      facilities: { include: { facility: true } },
    },
  });
}

export function formatPrice(
  price: number,
  period: PricePeriod,
  locale: Locale = "en"
) {
  const messages = getMessages(locale);
  const suffix =
    period === "MONTHLY" ? messages.villa.perMonth : messages.villa.perNight;
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
