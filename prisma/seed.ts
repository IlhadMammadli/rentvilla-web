import { PrismaClient, UserRole, PricePeriod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AZERBAIJAN_CITIES = [
  "Bakı",
  "Gəncə",
  "Sumqayıt",
  "Mingəçevir",
  "Lənkəran",
  "Şirvan",
  "Naxçıvan",
  "Şəki",
  "Yevlax",
  "Xankəndi",
  "Quba",
  "Qusar",
  "Şamaxı",
  "İsmayıllı",
  "Ağsu",
  "Zaqatala",
  "Balakən",
  "Şəmkir",
  "Göyçay",
  "Bərdə",
  "Ağcabədi",
  "Füzuli",
  "Xaçmaz",
  "Salyan",
  "Neftçala",
  "Masallı",
  "Astara",
  "Cəlilabad",
  "Biləsuvar",
  "Sabirabad",
  "Saatlı",
  "İmişli",
  "Beyləqan",
  "Ağdaş",
  "Ucar",
  "Kürdəmir",
  "Ağdam",
  "Tərtər",
  "Goranboy",
  "Naftalan",
  "Xızı",
  "Siyəzən",
  "Şabran",
  "Qəbələ",
  "Oğuz",
  "Qax",
  "Zaqatala",
  "Lerik",
  "Yardımlı",
  "Culfa",
  "Ordubad",
  "Şahbuz",
  "Babək",
];

const DEFAULT_FACILITIES = [
  { name: "Swimming pool", slug: "swimming-pool" },
  { name: "Hot swimming pool", slug: "hot-swimming-pool" },
  { name: "Outside kitchen", slug: "outside-kitchen" },
  { name: "Wi-Fi", slug: "wifi" },
  { name: "Parking", slug: "parking" },
  { name: "Air conditioning", slug: "air-conditioning" },
  { name: "Sauna", slug: "sauna" },
  { name: "BBQ area", slug: "bbq-area" },
];

async function main() {
  const adminPassword = await bcrypt.hash("Im19951411", 12);

  await prisma.user.upsert({
    where: { email: "ilhadmammadli@gmail.com" },
    update: {
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email: "ilhadmammadli@gmail.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  for (const name of AZERBAIJAN_CITIES) {
    await prisma.city.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const facility of DEFAULT_FACILITIES) {
    await prisma.facility.upsert({
      where: { slug: facility.slug },
      update: { name: facility.name },
      create: facility,
    });
  }

  const ownerPassword = await bcrypt.hash("Demo1234!", 12);
  const demoOwner = await prisma.user.upsert({
    where: { email: "demo.owner@rentvilla.az" },
    update: {},
    create: {
      email: "demo.owner@rentvilla.az",
      phone: "+994501234567",
      passwordHash: ownerPassword,
      role: UserRole.VILLA_OWNER,
      villaOwnerProfile: {
        create: {
          firstName: "Rəşad",
          lastName: "Məmmədov",
          phone: "+994501234567",
        },
      },
    },
    include: { villaOwnerProfile: true },
  });

  const BAKU_DISTRICTS = [
    "Nərimanov",
    "Yasamal",
    "Sabunçu",
    "Xətai",
    "Nəsimi",
    "Səbail",
    "Binəqədi",
    "Suraxanı",
    "Pirallahı",
    "Bakıxanov",
    "Mərdəkan",
    "Buzovna",
    "Şüvəlan",
  ];

  const baku = await prisma.city.findFirst({ where: { name: "Bakı" } });
  if (baku) {
    for (const name of BAKU_DISTRICTS) {
      await prisma.cityDistrict.upsert({
        where: { cityId_name: { cityId: baku.id, name } },
        update: {},
        create: { cityId: baku.id, name },
      });
    }
  }
  const quba = await prisma.city.findFirst({ where: { name: "Quba" } });
  const pool = await prisma.facility.findFirst({
    where: { slug: "swimming-pool" },
  });
  const wifi = await prisma.facility.findFirst({ where: { slug: "wifi" } });

  if (baku && demoOwner.villaOwnerProfile) {
    const existing = await prisma.villa.count({
      where: { userId: demoOwner.id },
    });
    if (existing === 0) {
      const mainUrl =
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80";
      const villa1 = await prisma.villa.create({
        data: {
          userId: demoOwner.id,
          cityId: baku.id,
          title: "Contemporary Beach House",
          description:
            "Modern villa with pool, sea view, and full amenities. Perfect for families and groups.",
          price: 650,
          pricePeriod: PricePeriod.DAILY,
          guestCount: 10,
          roomCount: 5,
          contactName: "Rəşad Məmmədov",
          contactPhone: "+994501234567",
          imageUrl: mainUrl,
          isPreview: true,
          address: "Bakı, Abşeron",
          images: {
            create: [
              { url: mainUrl, isMain: true, sortOrder: 0 },
              {
                url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
                isMain: false,
                sortOrder: 1,
              },
              {
                url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
                isMain: false,
                sortOrder: 2,
              },
            ],
          },
        },
      });

      if (pool) {
        await prisma.villaFacility.create({
          data: { villaId: villa1.id, facilityId: pool.id },
        });
      }
      if (wifi) {
        await prisma.villaFacility.create({
          data: { villaId: villa1.id, facilityId: wifi.id },
        });
      }

      if (quba) {
        await prisma.villa.create({
          data: {
            userId: demoOwner.id,
            cityId: quba.id,
            title: "Mountain Retreat Villa",
            description:
              "Cozy villa in the mountains with fireplace and panoramic views.",
            price: 420,
            pricePeriod: PricePeriod.DAILY,
            guestCount: 8,
            roomCount: 4,
            contactName: "Rəşad Məmmədov",
            contactPhone: "+994501234567",
            imageUrl:
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
            address: "Quba rayonu",
          },
        });
      }
    }
  }

  const legacyVillas = await prisma.villa.findMany({
    where: { imageUrl: { not: null }, images: { none: {} } },
  });
  for (const v of legacyVillas) {
    if (v.imageUrl) {
      await prisma.villaImage.create({
        data: { villaId: v.id, url: v.imageUrl, isMain: true, sortOrder: 0 },
      });
    }
  }

  console.log("Seed completed:");
  console.log("  Admin: ilhadmammadli@gmail.com / Im19951411");
  console.log("  Demo owner: demo.owner@rentvilla.az / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
