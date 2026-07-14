import { PromotionType } from "@prisma/client";
import { prisma } from "./prisma";
import { parseHighlightedVillaIds } from "./promotions";

export type PromotionStats = {
  promotionId: string;
  type: PromotionType;
  startsAt: Date | null;
  endsAt: Date | null;
  status: string;
  totalViews: number;
  totalContacts: number;
  totalFavorites: number;
  contactRate: number;
  viewsByDay: { date: string; count: number }[];
  contactsByDay: { date: string; count: number }[];
  villaBreakdown: {
    id: string;
    title: string;
    cityName: string;
    views: number;
    contacts: number;
    favorites: number;
    conversion: number;
  }[];
};

function toDayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildDailySeries(
  events: { createdAt: Date }[],
  from: Date,
  to: Date
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    map.set(toDayKey(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const event of events) {
    const key = toDayKey(event.createdAt);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

export async function getPromotionStats(promotionId: string, userId: string) {
  const promotion = await prisma.promotion.findFirst({
    where: { id: promotionId, userId },
    include: {
      villa: { include: { city: true } },
    },
  });

  if (!promotion) return null;

  const now = new Date();
  const rangeStart = promotion.startsAt ?? promotion.createdAt;
  const rangeEnd =
    promotion.endsAt && promotion.endsAt < now ? promotion.endsAt : now;

  let villaIds: string[] = [];

  if (promotion.type === PromotionType.VILLA && promotion.villaId) {
    villaIds = [promotion.villaId];
  } else if (promotion.type === PromotionType.PROFILE) {
    villaIds = parseHighlightedVillaIds(promotion.highlightedVillaIds);
    if (villaIds.length === 0) {
      const all = await prisma.villa.findMany({
        where: { userId, isPublished: true },
        select: { id: true },
      });
      villaIds = all.map((v) => v.id);
    }
  }

  if (villaIds.length === 0) {
    return {
      promotionId: promotion.id,
      type: promotion.type,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      status: promotion.status,
      totalViews: 0,
      totalContacts: 0,
      totalFavorites: 0,
      contactRate: 0,
      viewsByDay: [],
      contactsByDay: [],
      villaBreakdown: [],
    } satisfies PromotionStats;
  }

  const dateFilter = {
    gte: rangeStart,
    lte: rangeEnd,
  };

  const [views, contacts, favorites, villas] = await Promise.all([
    prisma.villaView.findMany({
      where: { villaId: { in: villaIds }, createdAt: dateFilter },
      select: { villaId: true, createdAt: true },
    }),
    prisma.villaContactReveal.findMany({
      where: { villaId: { in: villaIds }, createdAt: dateFilter },
      select: { villaId: true, createdAt: true },
    }),
    prisma.villaFavorite.findMany({
      where: { villaId: { in: villaIds }, createdAt: dateFilter },
      select: { villaId: true, createdAt: true },
    }),
    prisma.villa.findMany({
      where: { id: { in: villaIds } },
      include: { city: true },
    }),
  ]);

  const totalViews = views.length;
  const totalContacts = contacts.length;
  const totalFavorites = favorites.length;
  const contactRate = totalViews > 0 ? Math.round((totalContacts / totalViews) * 1000) / 10 : 0;

  const villaBreakdown = villas.map((villa) => {
    const vViews = views.filter((v) => v.villaId === villa.id).length;
    const vContacts = contacts.filter((c) => c.villaId === villa.id).length;
    const vFavorites = favorites.filter((f) => f.villaId === villa.id).length;
    const conversion = vViews > 0 ? Math.round((vContacts / vViews) * 1000) / 10 : 0;

    return {
      id: villa.id,
      title: villa.title,
      cityName: villa.city.name,
      views: vViews,
      contacts: vContacts,
      favorites: vFavorites,
      conversion,
    };
  });

  return {
    promotionId: promotion.id,
    type: promotion.type,
    startsAt: promotion.startsAt,
    endsAt: promotion.endsAt,
    status: promotion.status,
    totalViews,
    totalContacts,
    totalFavorites,
    contactRate,
    viewsByDay: buildDailySeries(views, rangeStart, rangeEnd),
    contactsByDay: buildDailySeries(contacts, rangeStart, rangeEnd),
    villaBreakdown,
  } satisfies PromotionStats;
}
