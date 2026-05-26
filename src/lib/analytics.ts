import { prisma } from "./prisma";

const sevenDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

export async function recordVillaView(villaId: string, visitorId?: string) {
  return prisma.villaView.create({
    data: { villaId, visitorId: visitorId ?? null },
  });
}

export async function recordContactReveal(villaId: string, visitorId?: string) {
  return prisma.villaContactReveal.create({
    data: { villaId, visitorId: visitorId ?? null },
  });
}

export async function getOwnerDashboardStats(userId: string) {
  const villas = await prisma.villa.findMany({
    where: { userId },
    include: {
      city: true,
      _count: {
        select: {
          views: true,
          contactReveals: true,
          favorites: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const villaIds = villas.map((v) => v.id);
  const since = sevenDaysAgo();

  const [viewsLast7, contactsLast7] = await Promise.all([
    villaIds.length
      ? prisma.villaView.count({
          where: { villaId: { in: villaIds }, createdAt: { gte: since } },
        })
      : 0,
    villaIds.length
      ? prisma.villaContactReveal.count({
          where: { villaId: { in: villaIds }, createdAt: { gte: since } },
        })
      : 0,
  ]);

  const totalViews = villas.reduce((s, v) => s + v._count.views, 0);
  const totalContacts = villas.reduce((s, v) => s + v._count.contactReveals, 0);
  const totalFavorites = villas.reduce((s, v) => s + v._count.favorites, 0);
  const contactRate =
    totalViews > 0 ? Math.round((totalContacts / totalViews) * 100) : 0;

  const villasWithStats = villas.map((v) => ({
    id: v.id,
    title: v.title,
    cityName: v.city.name,
    price: v.price,
    pricePeriod: v.pricePeriod,
    isPublished: v.isPublished,
    views: v._count.views,
    contacts: v._count.contactReveals,
    favorites: v._count.favorites,
    conversion:
      v._count.views > 0
        ? Math.round((v._count.contactReveals / v._count.views) * 100)
        : 0,
  }));

  const mostViewed = [...villasWithStats].sort((a, b) => b.views - a.views)[0] ?? null;
  const mostContacted =
    [...villasWithStats].sort((a, b) => b.contacts - a.contacts)[0] ?? null;
  const mostFavorited =
    [...villasWithStats].sort((a, b) => b.favorites - a.favorites)[0] ?? null;

  const topPerformer =
    [...villasWithStats].sort(
      (a, b) => b.contacts * 2 + b.views - (a.contacts * 2 + a.views)
    )[0] ?? null;

  return {
    totalListings: villas.length,
    totalViews,
    totalContacts,
    totalFavorites,
    contactRate,
    viewsLast7,
    contactsLast7,
    mostViewed,
    mostContacted,
    mostFavorited,
    topPerformer,
    villas: villasWithStats,
  };
}
