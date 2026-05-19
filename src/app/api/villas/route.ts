import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSessionUser, normalizePhone } from "@/lib/auth";
import { PricePeriod, UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (
    !session ||
    (session.role !== UserRole.VILLA_OWNER && session.role !== UserRole.REALTOR)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const cityId = String(formData.get("cityId") ?? "");
    const price = parseFloat(String(formData.get("price") ?? "0"));
    const pricePeriod = String(formData.get("pricePeriod") ?? "DAILY") as PricePeriod;
    const guestCount = parseInt(String(formData.get("guestCount") ?? "0"), 10);
    const roomCount = parseInt(String(formData.get("roomCount") ?? "0"), 10);
    const contactName = String(formData.get("contactName") ?? "").trim();
    const contactPhone = normalizePhone(String(formData.get("contactPhone") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const facilityIds = formData.getAll("facilityIds") as string[];
    const imageFile = formData.get("image") as File | null;

    if (
      !title ||
      !cityId ||
      !price ||
      !guestCount ||
      !roomCount ||
      !contactName ||
      !description
    ) {
      return NextResponse.json(
        { error: "Please fill all required fields" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(imageFile.name) || ".jpg";
      const filename = `villa-${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "villas");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/villas/${filename}`;
    }

    const villa = await prisma.villa.create({
      data: {
        userId: session.id,
        cityId,
        title,
        description,
        price,
        pricePeriod: pricePeriod === "MONTHLY" ? PricePeriod.MONTHLY : PricePeriod.DAILY,
        guestCount,
        roomCount,
        contactName,
        contactPhone,
        address: address || null,
        imageUrl,
        facilities: {
          create: facilityIds.map((facilityId) => ({ facilityId })),
        },
      },
    });

    return NextResponse.json({ success: true, id: villa.id });
  } catch (error) {
    console.error("Create villa error:", error);
    return NextResponse.json({ error: "Failed to create villa" }, { status: 500 });
  }
}
