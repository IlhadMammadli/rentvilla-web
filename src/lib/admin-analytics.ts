import { prisma } from "./prisma";
import { getTopRatedVillasAdmin } from "./villa-reviews";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getAdminAnalytics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    totalViews,
    totalContacts,
    viewsToday,
    viewsThisMonth,
    contactsToday,
    contactsThisMonth,
    totalFavorites,
    topViewedVillas,
    topContactVillas,
    topFavoriteVillas,
    allViews,
    allContacts,
  ] = await Promise.all([
    prisma.villaView.count(),
    prisma.villaContactReveal.count(),
    prisma.villaView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.villaView.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.villaContactReveal.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.villaContactReveal.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.villaFavorite.count(),
    prisma.villa.findMany({
      include: {
        city: true,
        user: {
          include: { villaOwnerProfile: true, realtorProfile: true },
        },
        _count: { select: { views: true, contactReveals: true } },
      },
      orderBy: { views: { _count: "desc" } },
      take: 50,
    }),
    prisma.villa.findMany({
      include: {
        city: true,
        user: {
          include: { villaOwnerProfile: true, realtorProfile: true },
        },
        _count: { select: { views: true, contactReveals: true } },
      },
      orderBy: { contactReveals: { _count: "desc" } },
      take: 50,
    }),
    prisma.villa.findMany({
      include: {
        city: true,
        user: {
          include: { villaOwnerProfile: true, realtorProfile: true },
        },
        _count: { select: { views: true, contactReveals: true, favorites: true } },
      },
      orderBy: { favorites: { _count: "desc" } },
      take: 50,
    }),
    prisma.villaView.findMany({
      select: { createdAt: true },
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
    }),
    prisma.villaContactReveal.findMany({
      select: { createdAt: true },
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
    }),
  ]);

  const ownerStats = await prisma.user.findMany({
    where: {
      role: { in: ["VILLA_OWNER", "REALTOR"] },
      isBlocked: false,
    },
    include: {
      villaOwnerProfile: true,
      realtorProfile: true,
      villas: {
        include: { _count: { select: { views: true, contactReveals: true, favorites: true } } },
      },
    },
  });

  const ownerRankings = ownerStats
    .map((u) => {
      const name = u.villaOwnerProfile
        ? `${u.villaOwnerProfile.firstName} ${u.villaOwnerProfile.lastName}`
        : u.realtorProfile?.companyName ?? u.email ?? "—";
      const views = u.villas.reduce((s, v) => s + v._count.views, 0);
      const contacts = u.villas.reduce((s, v) => s + v._count.contactReveals, 0);
      const favorites = u.villas.reduce((s, v) => s + v._count.favorites, 0);
      return {
        id: u.id,
        name,
        email: u.email,
        role: u.role,
        villaCount: u.villas.length,
        views,
        contacts,
        favorites,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  const topRatedVillas = await getTopRatedVillasAdmin(20);

  const viewsByDay = aggregateByDay(allViews.map((v) => v.createdAt));
  const viewsByMonth = aggregateByMonth(allViews.map((v) => v.createdAt));
  const contactsByDay = aggregateByDay(allContacts.map((c) => c.createdAt));
  const contactsByMonth = aggregateByMonth(allContacts.map((c) => c.createdAt));

  return {
    totals: {
      views: totalViews,
      contacts: totalContacts,
      viewsToday,
      viewsThisMonth,
      contactsToday,
      contactsThisMonth,
      favorites: totalFavorites,
    },
    topViewedVillas: topViewedVillas.map((v) => ({
      id: v.id,
      title: v.title,
      city: v.city.name,
      isPublished: v.isPublished,
      isPromoted: v.isPromoted,
      views: v._count.views,
      contacts: v._count.contactReveals,
      ownerName: getOwnerName(v.user),
    })),
    topContactVillas: topContactVillas.map((v) => ({
      id: v.id,
      title: v.title,
      city: v.city.name,
      isPublished: v.isPublished,
      contacts: v._count.contactReveals,
      views: v._count.views,
      ownerName: getOwnerName(v.user),
    })),
    topFavoriteVillas: topFavoriteVillas.map((v) => ({
      id: v.id,
      title: v.title,
      city: v.city.name,
      isPublished: v.isPublished,
      favorites: v._count.favorites,
      views: v._count.views,
      ownerName: getOwnerName(v.user),
    })),
    topRatedVillas: topRatedVillas.map((v) => ({
      id: v.id,
      title: v.title,
      city: v.city.name,
      isPublished: v.isPublished,
      avgRating: v.avgRating,
      reviewCount: v.reviewCount,
      ownerName: getOwnerName(v.user),
    })),
    topOwners: ownerRankings,
    traffic: {
      viewsByDay,
      viewsByMonth,
      contactsByDay,
      contactsByMonth,
    },
  };
}

function getOwnerName(
  user: {
    email: string | null;
    villaOwnerProfile: { firstName: string; lastName: string } | null;
    realtorProfile: { companyName: string } | null;
  }
) {
  if (user.villaOwnerProfile) {
    return `${user.villaOwnerProfile.firstName} ${user.villaOwnerProfile.lastName}`;
  }
  if (user.realtorProfile) return user.realtorProfile.companyName;
  return user.email ?? "—";
}

function aggregateByDay(dates: Date[]) {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function aggregateByMonth(dates: Date[]) {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}
