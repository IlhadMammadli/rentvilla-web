import { prisma } from "./prisma";

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

function buildWhere(filters?: VillaSearchFilters) {
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
  return prisma.villa.findMany({
    where: buildWhere(filters),
    include: villaInclude,
    orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAllPublishedVillas(filters?: VillaSearchFilters) {
  return searchPublishedVillas(filters);
}

export async function getPromotedVillas(filters?: VillaSearchFilters) {
  return prisma.villa.findMany({
    where: { ...buildWhere(filters), isPromoted: true },
    include: villaInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getRegularVillas(filters?: VillaSearchFilters) {
  return prisma.villa.findMany({
    where: { ...buildWhere(filters), isPromoted: false },
    include: villaInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromotedRealtors() {
  return prisma.user.findMany({
    where: {
      isBlocked: false,
      role: "REALTOR",
      realtorProfile: { isPromoted: true },
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
