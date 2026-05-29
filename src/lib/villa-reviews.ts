import { prisma } from "./prisma";
import { villaInclude, buildWhere, type VillaSearchFilters } from "./villa-search";

export type VillaRatingSummary = {
  average: number;
  count: number;
};

export type VillaWithRating = {
  avgRating: number;
  reviewCount: number;
};

export async function getVillaRatingSummary(villaId: string): Promise<VillaRatingSummary> {
  const agg = await prisma.villaReview.aggregate({
    where: { villaId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    count: agg._count.rating,
  };
}

export async function getVillaReviews(villaId: string) {
  return prisma.villaReview.findMany({
    where: { villaId },
    include: {
      user: {
        include: {
          villaOwnerProfile: true,
          guestProfile: true,
          realtorProfile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function displayReviewerName(
  user: {
    villaOwnerProfile: { firstName: string; lastName: string } | null;
    guestProfile: { firstName: string; lastName: string } | null;
    realtorProfile: { companyName: string } | null;
  } | null
) {
  if (!user) return "Guest";
  if (user.realtorProfile) return user.realtorProfile.companyName;
  if (user.villaOwnerProfile) {
    return `${user.villaOwnerProfile.firstName} ${user.villaOwnerProfile.lastName}`;
  }
  if (user.guestProfile) {
    return `${user.guestProfile.firstName} ${user.guestProfile.lastName}`;
  }
  return "Guest";
}

export async function upsertVillaReview(
  villaId: string,
  userId: string,
  rating: number,
  comment?: string
) {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId, isPublished: true },
    select: { userId: true },
  });
  if (!villa) return { error: "Villa not found", status: 404 as const };
  if (villa.userId === userId) {
    return { error: "You cannot review your own villa", status: 400 as const };
  }
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be between 1 and 5", status: 400 as const };
  }

  const trimmed = comment?.trim() ?? "";
  if (trimmed.length > 2000) {
    return { error: "Comment is too long", status: 400 as const };
  }

  await prisma.villaReview.upsert({
    where: { villaId_userId: { villaId, userId } },
    create: {
      villaId,
      userId,
      rating,
      comment: trimmed || null,
    },
    update: {
      rating,
      comment: trimmed || null,
    },
  });

  return { success: true };
}

type VillaListRow = Awaited<ReturnType<typeof prisma.villa.findMany>>[number];

function attachRatings<T extends VillaListRow>(villas: T[]) {
  return villas.map((v) => {
    const reviews = (v as T & { reviews: { rating: number }[] }).reviews ?? [];
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
        : 0;
    return { ...v, avgRating, reviewCount };
  });
}

export async function getTopRatedVillas(filters?: VillaSearchFilters, limit = 12) {
  const villas = await prisma.villa.findMany({
    where: buildWhere(filters),
    include: {
      ...villaInclude,
      reviews: { select: { rating: true } },
    },
  });

  return attachRatings(villas)
    .filter((v) => v.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export async function getTopRatedVillasForOwner(userId: string, limit = 5) {
  const villas = await prisma.villa.findMany({
    where: { userId },
    include: {
      city: true,
      reviews: { select: { rating: true } },
    },
  });

  return attachRatings(villas)
    .filter((v) => v.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export async function getRatingMapForVillaIds(villaIds: string[]) {
  if (villaIds.length === 0) return new Map<string, VillaRatingSummary>();

  const groups = await prisma.villaReview.groupBy({
    by: ["villaId"],
    where: { villaId: { in: villaIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return new Map(
    groups.map((g) => [
      g.villaId,
      {
        average: g._avg.rating ? Math.round(g._avg.rating * 10) / 10 : 0,
        count: g._count._all,
      },
    ])
  );
}

export function enrichVillasWithRatings<T extends { id: string }>(
  villas: T[],
  ratingMap: Map<string, VillaRatingSummary>
) {
  return villas.map((v) => {
    const r = ratingMap.get(v.id);
    return {
      ...v,
      avgRating: r?.average ?? 0,
      reviewCount: r?.count ?? 0,
    };
  });
}

export async function getTopRatedVillasAdmin(limit = 20) {
  const villas = await prisma.villa.findMany({
    where: { isPublished: true, user: { isBlocked: false } },
    include: {
      city: true,
      user: {
        include: { villaOwnerProfile: true, realtorProfile: true },
      },
      reviews: { select: { rating: true } },
    },
  });

  return attachRatings(villas)
    .filter((v) => v.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}
