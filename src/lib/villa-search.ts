import { prisma } from "./prisma";
import { syncExpiredPromotions } from "./promotions";

export type VillaSearchFilters = {
  cityId?: string;
  districtId?: string;
  minGuests?: number;
  minRooms?: number;
  facilityIds?: string[];
  realtorUserId?: string;
  aframeOnly?: boolean;
};

const publishedWhere = {
  isPublished: true,
  user: { isBlocked: false },
};

function activeVillaPromotionWhere() {
  const now = new Date();
  return {
    OR: [
      { promotedUntil: { gt: now } },
      { isPromoted: true, promotedUntil: null },
    ],
  };
}

function activeRealtorPromotionWhere() {
  const now = new Date();
  return {
    OR: [
      { isPromoted: true, promotedUntil: { gt: now } },
      { isPromoted: true, promotedUntil: null },
    ],
  };
}

export const villaInclude = {
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

export function buildWhere(filters?: VillaSearchFilters) {
  const facilityIds =
    filters?.facilityIds?.filter(Boolean) ?? [];

  return {
    ...publishedWhere,
    ...(filters?.cityId ? { cityId: filters.cityId } : {}),
    ...(filters?.districtId ? { districtId: filters.districtId } : {}),
    ...(filters?.minGuests ? { guestCount: { gte: filters.minGuests } } : {}),
    ...(filters?.minRooms ? { roomCount: { gte: filters.minRooms } } : {}),
    ...(filters?.realtorUserId ? { userId: filters.realtorUserId } : {}),
    ...(filters?.aframeOnly ? { isAFrame: true } : {}),
    ...(facilityIds.length > 0
      ? {
          AND: facilityIds.map((facilityId) => ({
            facilities: { some: { facilityId } },
          })),
        }
      : {}),
  };
}

export async function searchPublishedVillas(filters?: VillaSearchFilters) {
  await syncExpiredPromotions();

  return prisma.villa.findMany({
    where: buildWhere(filters),
    include: villaInclude,
    orderBy: [{ promotedUntil: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export async function getAllPublishedVillas(filters?: VillaSearchFilters) {
  return searchPublishedVillas(filters);
}

export async function getPromotedVillas(filters?: VillaSearchFilters) {
  await syncExpiredPromotions();

  return prisma.villa.findMany({
    where: { ...buildWhere(filters), ...activeVillaPromotionWhere() },
    include: villaInclude,
    orderBy: { promotedUntil: "desc" },
  });
}

export async function getRegularVillas(filters?: VillaSearchFilters) {
  await syncExpiredPromotions();

  const now = new Date();
  return prisma.villa.findMany({
    where: {
      ...buildWhere(filters),
      OR: [{ promotedUntil: null }, { promotedUntil: { lte: now } }],
    },
    include: villaInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromotedRealtors() {
  await syncExpiredPromotions();

  return prisma.user.findMany({
    where: {
      isBlocked: false,
      role: "REALTOR",
      realtorProfile: activeRealtorPromotionWhere(),
    },
    include: {
      realtorProfile: true,
      _count: {
        select: {
          villas: { where: publishedWhere },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type PromotedRealtorWithHighlights = Awaited<
  ReturnType<typeof getPromotedRealtorsWithHighlights>
>[number];

export async function getPromotedRealtorsWithHighlights() {
  await syncExpiredPromotions();

  const realtors = await prisma.user.findMany({
    where: {
      isBlocked: false,
      role: "REALTOR",
      realtorProfile: activeRealtorPromotionWhere(),
    },
    include: {
      realtorProfile: true,
      _count: {
        select: { villas: { where: publishedWhere } },
      },
      villas: {
        where: {
          ...publishedWhere,
          highlightInProfile: true,
        },
        include: {
          city: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return realtors;
}

export function parseVillaSearchParams(
  params: Record<string, string | string[] | undefined>
): VillaSearchFilters {
  const cityId = typeof params.city === "string" ? params.city : undefined;
  const districtId =
    typeof params.district === "string" ? params.district : undefined;
  const guests =
    typeof params.guests === "string" ? parseInt(params.guests, 10) : undefined;
  const rooms =
    typeof params.rooms === "string" ? parseInt(params.rooms, 10) : undefined;
  const realtorUserId =
    typeof params.company === "string" ? params.company : undefined;
  const aframeOnly = params.aframe === "1" || params.aframe === "true";

  let facilityIds: string[] | undefined;
  if (typeof params.facilities === "string" && params.facilities) {
    facilityIds = params.facilities.split(",").filter(Boolean);
  }

  return {
    cityId: cityId || undefined,
    districtId: districtId || undefined,
    minGuests: guests && guests > 0 ? guests : undefined,
    minRooms: rooms && rooms > 0 ? rooms : undefined,
    facilityIds,
    realtorUserId,
    aframeOnly: aframeOnly || undefined,
  };
}

export function hasActiveFilters(filters: VillaSearchFilters): boolean {
  return Boolean(
    filters.cityId ||
      filters.districtId ||
      filters.minGuests ||
      filters.minRooms ||
      filters.aframeOnly ||
      (filters.facilityIds && filters.facilityIds.length > 0) ||
      filters.realtorUserId
  );
}

export function hasSearchFilters(filters: VillaSearchFilters): boolean {
  return Boolean(
    filters.cityId ||
      filters.districtId ||
      filters.minGuests ||
      filters.minRooms ||
      (filters.facilityIds && filters.facilityIds.length > 0) ||
      filters.realtorUserId
  );
}
