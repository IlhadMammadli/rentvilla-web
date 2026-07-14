import {
  PromotionStatus,
  PromotionTier,
  PromotionType,
  type UserRole,
} from "@prisma/client";
import { prisma } from "./prisma";
import { PROMOTION_PRICES, PROMOTION_TIER_DAYS, MAX_HIGHLIGHT_VILLAS } from "./constants";
import { createPayriffOrder, getPayriffOrder, getSiteBaseUrl, isPayriffOrderPaid } from "./payriff";

export function getPromotionPrice(type: PromotionType, tier: PromotionTier) {
  const key = type === "VILLA" ? "VILLA" : "PROFILE";
  return PROMOTION_PRICES[key][tier];
}

export function getTierDurationDays(tier: PromotionTier) {
  return PROMOTION_TIER_DAYS[tier];
}

export function computePromotionEnd(from: Date, tier: PromotionTier) {
  const end = new Date(from);
  end.setDate(end.getDate() + getTierDurationDays(tier));
  return end;
}

export function parseHighlightedVillaIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function syncExpiredPromotions() {
  const now = new Date();

  await prisma.villa.updateMany({
    where: { promotedUntil: { lte: now } },
    data: { isPromoted: false, highlightInProfile: false },
  });

  await prisma.realtorProfile.updateMany({
    where: { promotedUntil: { lte: now } },
    data: { isPromoted: false },
  });

  await prisma.promotion.updateMany({
    where: {
      status: PromotionStatus.ACTIVE,
      endsAt: { lte: now },
    },
    data: { status: PromotionStatus.EXPIRED },
  });
}

export async function getUserPromotions(userId: string) {
  await syncExpiredPromotions();

  return prisma.promotion.findMany({
    where: { userId },
    include: {
      villa: { select: { id: true, title: true, city: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromotionForUser(promotionId: string, userId: string) {
  await syncExpiredPromotions();

  return prisma.promotion.findFirst({
    where: { id: promotionId, userId },
    include: {
      villa: {
        include: {
          city: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });
}

type CreatePromotionInput = {
  userId: string;
  userRole: UserRole;
  type: PromotionType;
  tier: PromotionTier;
  villaId?: string;
  highlightedVillaIds?: string[];
  language?: "AZ" | "EN" | "RU";
};

export async function createPromotionOrder(input: CreatePromotionInput) {
  const { userId, userRole, type, tier } = input;

  if (type === "PROFILE" && userRole !== "REALTOR") {
    return { error: "Only realtors can promote their company profile", status: 400 as const };
  }

  if (!["VILLA_OWNER", "REALTOR", "GUEST"].includes(userRole)) {
    return { error: "Your account cannot purchase promotions", status: 403 as const };
  }

  const amount = getPromotionPrice(type, tier);
  if (amount <= 0) {
    return { error: "Invalid promotion price", status: 400 as const };
  }

  let villaId: string | null = null;
  let highlightedVillaIds: string[] = [];

  if (type === "VILLA") {
    if (!input.villaId) {
      return { error: "Select a villa to promote", status: 400 as const };
    }

    const villa = await prisma.villa.findFirst({
      where: { id: input.villaId, userId, isPublished: true },
      select: { id: true, title: true },
    });

    if (!villa) {
      return { error: "Villa not found or not published", status: 404 as const };
    }

    villaId = villa.id;
  } else {
    highlightedVillaIds = (input.highlightedVillaIds ?? []).slice(0, MAX_HIGHLIGHT_VILLAS);

    if (highlightedVillaIds.length === 0) {
      return { error: "Select at least one villa to highlight", status: 400 as const };
    }

    const owned = await prisma.villa.findMany({
      where: {
        userId,
        id: { in: highlightedVillaIds },
        isPublished: true,
      },
      select: { id: true },
    });

    if (owned.length !== highlightedVillaIds.length) {
      return { error: "Invalid highlighted villas", status: 400 as const };
    }
  }

  const promotion = await prisma.promotion.create({
    data: {
      userId,
      type,
      tier,
      amount,
      currency: "AZN",
      status: PromotionStatus.PENDING,
      villaId,
      highlightedVillaIds:
        highlightedVillaIds.length > 0 ? JSON.stringify(highlightedVillaIds) : null,
    },
  });

  const baseUrl = getSiteBaseUrl();
  const callbackUrl = `${baseUrl}/api/promotions/callback`;
  const description =
    type === "VILLA"
      ? `VillaHub villa promotion (${tier.toLowerCase()})`
      : `VillaHub realtor profile promotion (${tier.toLowerCase()})`;

  const payriff = await createPayriffOrder({
    amount,
    description,
    callbackUrl,
    language: input.language,
    metadata: {
      promotionId: promotion.id,
      userId,
      type,
      tier,
    },
  });

  if ("error" in payriff) {
    await prisma.promotion.update({
      where: { id: promotion.id },
      data: { status: PromotionStatus.FAILED },
    });
    return payriff;
  }

  await prisma.promotion.update({
    where: { id: promotion.id },
    data: {
      payriffOrderId: payriff.orderId,
      payriffPaymentUrl: payriff.paymentUrl,
    },
  });

  return {
    success: true as const,
    promotionId: promotion.id,
    paymentUrl: payriff.paymentUrl,
    amount,
  };
}

export async function activatePromotion(promotionId: string) {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
    include: { user: { include: { realtorProfile: true } } },
  });

  if (!promotion) {
    return { error: "Promotion not found", status: 404 as const };
  }

  if (promotion.status === PromotionStatus.ACTIVE || promotion.status === PromotionStatus.PAID) {
    return { success: true as const, alreadyActive: true };
  }

  if (promotion.status !== PromotionStatus.PENDING) {
    return { error: "Promotion cannot be activated", status: 400 as const };
  }

  const now = new Date();
  let startsAt = now;
  let endsAt = computePromotionEnd(now, promotion.tier);

  if (promotion.type === PromotionType.VILLA && promotion.villaId) {
    const villa = await prisma.villa.findUnique({
      where: { id: promotion.villaId },
      select: { promotedUntil: true },
    });

    if (villa?.promotedUntil && villa.promotedUntil > now) {
      startsAt = villa.promotedUntil;
      endsAt = computePromotionEnd(startsAt, promotion.tier);
    }

    await prisma.villa.update({
      where: { id: promotion.villaId },
      data: { isPromoted: true, promotedUntil: endsAt },
    });
  }

  if (promotion.type === PromotionType.PROFILE) {
    const profile = promotion.user.realtorProfile;
    if (!profile) {
      return { error: "Realtor profile not found", status: 400 as const };
    }

    if (profile.promotedUntil && profile.promotedUntil > now) {
      startsAt = profile.promotedUntil;
      endsAt = computePromotionEnd(startsAt, promotion.tier);
    }

    await prisma.realtorProfile.update({
      where: { userId: promotion.userId },
      data: { isPromoted: true, promotedUntil: endsAt },
    });

    const highlightIds = parseHighlightedVillaIds(promotion.highlightedVillaIds);

    await prisma.villa.updateMany({
      where: { userId: promotion.userId },
      data: { highlightInProfile: false },
    });

    if (highlightIds.length > 0) {
      await prisma.villa.updateMany({
        where: { userId: promotion.userId, id: { in: highlightIds } },
        data: { highlightInProfile: true },
      });
    }
  }

  await prisma.promotion.update({
    where: { id: promotion.id },
    data: {
      status: PromotionStatus.ACTIVE,
      paidAt: now,
      startsAt,
      endsAt,
    },
  });

  return { success: true as const };
}

export async function verifyAndActivatePromotion(promotionId: string) {
  const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });

  if (!promotion) {
    return { error: "Promotion not found", status: 404 as const };
  }

  if (promotion.status === PromotionStatus.ACTIVE) {
    return { success: true as const, alreadyActive: true, promotionId: promotion.id };
  }

  if (!promotion.payriffOrderId) {
    return { error: "No payment order linked", status: 400 as const };
  }

  const orderResult = await getPayriffOrder(promotion.payriffOrderId);
  if ("error" in orderResult) {
    return { error: orderResult.error, status: orderResult.status };
  }

  if (!isPayriffOrderPaid(orderResult.order.paymentStatus)) {
    await prisma.promotion.update({
      where: { id: promotionId },
      data: { status: PromotionStatus.FAILED },
    });
    return { error: "Payment not completed", status: 402 as const };
  }

  const activated = await activatePromotion(promotionId);
  if ("error" in activated) return activated;
  return { success: true as const, promotionId: promotion.id };
}

export async function handlePayriffCallback(body: Record<string, unknown>) {
  const promotionId =
    (body.promotionId as string) ||
    ((body.metadata as Record<string, string> | undefined)?.promotionId ?? "");

  const orderId =
    (body.orderId as string) ||
    (body.orderID as string) ||
    ((body.payload as Record<string, string> | undefined)?.orderId ?? "");

  let promotion = promotionId
    ? await prisma.promotion.findUnique({ where: { id: promotionId } })
    : orderId
      ? await prisma.promotion.findUnique({ where: { payriffOrderId: orderId } })
      : null;

  if (!promotion && orderId) {
    promotion = await prisma.promotion.findFirst({ where: { payriffOrderId: orderId } });
  }

  if (!promotion) {
    return { error: "Promotion not found", status: 404 as const };
  }

  const result = await verifyAndActivatePromotion(promotion.id);
  if ("error" in result) {
    return result;
  }

  return { success: true as const, promotionId: promotion.id };
}