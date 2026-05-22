/**
 * One-time migration: copy data from prisma/dev.db (SQLite) → DATABASE_URL (PostgreSQL).
 * Run: npm run db:migrate-from-sqlite
 */
import { execSync } from "child_process";
import path from "path";
import { PrismaClient, UserRole, PricePeriod } from "@prisma/client";

const prisma = new PrismaClient();
const sqlitePath = path.join(process.cwd(), "prisma", "dev.db");

function sqliteQuery<T>(sql: string): T[] {
  const escaped = sql.replace(/"/g, '""');
  try {
    const out = execSync(`sqlite3 "${sqlitePath}" -json "${escaped}"`, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    if (!out.trim()) return [];
    return JSON.parse(out) as T[];
  } catch {
    return [];
  }
}

async function main() {
  const sqliteExists = execSync(`test -f "${sqlitePath}" && echo yes || echo no`, {
    encoding: "utf8",
  }).trim();
  if (sqliteExists !== "yes") {
    console.error("No prisma/dev.db found. Nothing to migrate.");
    process.exit(1);
  }

  console.log("Migrating from SQLite → PostgreSQL…\n");

  const cityIdMap = new Map<string, string>();
  for (const row of sqliteQuery<{ id: string; name: string }>(
    "SELECT id, name FROM City"
  )) {
    const city = await prisma.city.upsert({
      where: { name: row.name },
      update: {},
      create: { name: row.name },
    });
    cityIdMap.set(row.id, city.id);
  }
  console.log(`Cities: ${cityIdMap.size}`);

  const facilityIdMap = new Map<string, string>();
  for (const row of sqliteQuery<{ id: string; name: string; slug: string }>(
    "SELECT id, name, slug FROM Facility"
  )) {
    const facility = await prisma.facility.upsert({
      where: { slug: row.slug },
      update: { name: row.name },
      create: { name: row.name, slug: row.slug },
    });
    facilityIdMap.set(row.id, facility.id);
  }
  console.log(`Facilities: ${facilityIdMap.size}`);

  const userIdMap = new Map<string, string>();
  const users = sqliteQuery<{
    id: string;
    email: string | null;
    phone: string | null;
    passwordHash: string;
    role: string;
  }>("SELECT id, email, phone, passwordHash, role FROM User");

  for (const row of users) {
    if (!row.email && !row.phone) continue;

    const role = row.role as UserRole;
    let user = row.email
      ? await prisma.user.findUnique({ where: { email: row.email } })
      : row.phone
        ? await prisma.user.findUnique({ where: { phone: row.phone } })
        : null;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: row.email,
          phone: row.phone,
          passwordHash: row.passwordHash,
          role,
        },
      });
    }
    userIdMap.set(row.id, user.id);

    const owner = sqliteQuery<{
      firstName: string;
      lastName: string;
      phone: string;
    }>(`SELECT firstName, lastName, phone FROM VillaOwnerProfile WHERE userId = '${row.id}'`);
    if (owner[0]) {
      await prisma.villaOwnerProfile.upsert({
        where: { userId: user.id },
        update: owner[0],
        create: { userId: user.id, ...owner[0] },
      });
    }

    const realtor = sqliteQuery<{
      companyName: string;
      companyLogo: string | null;
      phone: string;
    }>(`SELECT companyName, companyLogo, phone FROM RealtorProfile WHERE userId = '${row.id}'`);
    if (realtor[0]) {
      await prisma.realtorProfile.upsert({
        where: { userId: user.id },
        update: realtor[0],
        create: { userId: user.id, ...realtor[0] },
      });
    }
  }
  console.log(`Users: ${userIdMap.size}`);

  const villaIdMap = new Map<string, string>();
  const villas = sqliteQuery<{
    id: string;
    userId: string;
    cityId: string;
    title: string;
    description: string;
    price: number;
    pricePeriod: string;
    guestCount: number;
    roomCount: number;
    contactName: string;
    contactPhone: string;
    imageUrl: string | null;
    address: string | null;
    isPublished: number;
    isPreview: number;
  }>("SELECT * FROM Villa");

  for (const row of villas) {
    const newUserId = userIdMap.get(row.userId);
    const newCityId = cityIdMap.get(row.cityId);
    if (!newUserId || !newCityId) {
      console.warn(`Skip villa "${row.title}" — missing user or city`);
      continue;
    }

    const existing = await prisma.villa.findFirst({
      where: { title: row.title, userId: newUserId },
    });
    if (existing) {
      villaIdMap.set(row.id, existing.id);
      console.log(`Villa exists: ${row.title}`);
      continue;
    }

    const villa = await prisma.villa.create({
      data: {
        userId: newUserId,
        cityId: newCityId,
        title: row.title,
        description: row.description,
        price: row.price,
        pricePeriod:
          row.pricePeriod === "MONTHLY" ? PricePeriod.MONTHLY : PricePeriod.DAILY,
        guestCount: row.guestCount,
        roomCount: row.roomCount,
        contactName: row.contactName,
        contactPhone: row.contactPhone,
        imageUrl: row.imageUrl,
        address: row.address,
        isPublished: Boolean(row.isPublished),
        isPreview: Boolean(row.isPreview),
      },
    });
    villaIdMap.set(row.id, villa.id);
    console.log(`Migrated villa: ${row.title}`);
  }

  for (const row of sqliteQuery<{
    villaId: string;
    url: string;
    isMain: number;
    sortOrder: number;
  }>("SELECT villaId, url, isMain, sortOrder FROM VillaImage")) {
    const newVillaId = villaIdMap.get(row.villaId);
    if (!newVillaId) continue;
    const exists = await prisma.villaImage.findFirst({
      where: { villaId: newVillaId, url: row.url },
    });
    if (!exists) {
      await prisma.villaImage.create({
        data: {
          villaId: newVillaId,
          url: row.url,
          isMain: Boolean(row.isMain),
          sortOrder: row.sortOrder,
        },
      });
    }
  }

  for (const row of sqliteQuery<{ villaId: string; facilityId: string }>(
    "SELECT villaId, facilityId FROM VillaFacility"
  )) {
    const newVillaId = villaIdMap.get(row.villaId);
    const newFacilityId = facilityIdMap.get(row.facilityId);
    if (!newVillaId || !newFacilityId) continue;
    await prisma.villaFacility.upsert({
      where: {
        villaId_facilityId: { villaId: newVillaId, facilityId: newFacilityId },
      },
      update: {},
      create: { villaId: newVillaId, facilityId: newFacilityId },
    });
  }

  const total = await prisma.villa.count();
  console.log(`\nDone. PostgreSQL now has ${total} villa(s).`);
  console.log("Restart npm run dev and check the home page.");
  console.log(
    "\nNote: Images under /uploads/villas/ work on localhost. For Netlify, set up Cloudinary (see docs/NETLIFY.md)."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
