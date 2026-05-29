import { prisma } from "./prisma";
import type { PricePeriod } from "@prisma/client";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { parsePostNumberQuery } from "./post-number";

const villaInclude = {
  city: true,
  district: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  facilities: { include: { facility: true } },
  user: {
    include: {
      villaOwnerProfile: true,
      realtorProfile: true,
    },
  },
};

const detailInclude = {
  city: true,
  district: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  facilities: { include: { facility: true } },
  user: { select: { id: true } },
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
    include: detailInclude,
  });
}

export async function getVillaByPostNumber(postNumber: number) {
  return prisma.villa.findUnique({
    where: { postNumber },
    include: detailInclude,
  });
}

export async function findAdminVillaByQuery(query: string) {
  const postNumber = parsePostNumberQuery(query);
  if (postNumber) {
    return prisma.villa.findUnique({
      where: { postNumber },
      include: {
        city: true,
        user: { select: { email: true, isBlocked: true } },
        _count: { select: { views: true, contactReveals: true } },
      },
    });
  }

  if (query.length >= 8) {
    return prisma.villa.findUnique({
      where: { id: query },
      include: {
        city: true,
        user: { select: { email: true, isBlocked: true } },
        _count: { select: { views: true, contactReveals: true } },
      },
    });
  }

  return null;
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

export async function getActiveCitiesWithDistricts() {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      districts: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      },
    },
  });
}

export async function getActiveFacilities() {
  return prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getUserVillaCount(userId: string) {
  return prisma.villa.count({ where: { userId } });
}
