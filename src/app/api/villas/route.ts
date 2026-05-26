import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, normalizePhone } from "@/lib/auth";
import { ensureVillaOwnerProfile } from "@/lib/ensure-owner-profile";
import { canListVillas } from "@/lib/roles";
import { saveVillaImage } from "@/lib/upload";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import { PricePeriod } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "GUEST") {
    await ensureVillaOwnerProfile(session.id);
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const cityId = String(formData.get("cityId") ?? "");
    const districtId = String(formData.get("districtId") ?? "").trim() || null;
    const price = parseFloat(String(formData.get("price") ?? "0"));
    const pricePeriod = String(formData.get("pricePeriod") ?? "DAILY") as PricePeriod;
    const guestCount = parseInt(String(formData.get("guestCount") ?? "0"), 10);
    const roomCount = parseInt(String(formData.get("roomCount") ?? "0"), 10);
    const contactName = String(formData.get("contactName") ?? "").trim();
    const contactPhone = normalizePhone(String(formData.get("contactPhone") ?? ""));
    const description = String(formData.get("description") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const isAFrame = formData.get("isAFrame") === "true";
    const facilityIds = formData.getAll("facilityIds") as string[];

    const mainImageFile = formData.get("mainImage") as File | null;
    const galleryFiles = formData
      .getAll("galleryImages")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_GALLERY_IMAGES);

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

    if (!mainImageFile || mainImageFile.size === 0) {
      return NextResponse.json(
        { error: "Main photo is required" },
        { status: 400 }
      );
    }

    if (districtId) {
      const district = await prisma.cityDistrict.findFirst({
        where: { id: districtId, cityId, isActive: true },
      });
      if (!district) {
        return NextResponse.json({ error: "Invalid district" }, { status: 400 });
      }
    }

    const mainImageUrl = await saveVillaImage(mainImageFile);
    const galleryUrls = await Promise.all(galleryFiles.map(saveVillaImage));

    const villa = await prisma.villa.create({
      data: {
        userId: session.id,
        cityId,
        districtId,
        title,
        description,
        price,
        pricePeriod: pricePeriod === "MONTHLY" ? PricePeriod.MONTHLY : PricePeriod.DAILY,
        guestCount,
        roomCount,
        contactName,
        contactPhone,
        address: address || null,
        isAFrame,
        imageUrl: mainImageUrl,
        facilities: {
          create: facilityIds.map((facilityId) => ({ facilityId })),
        },
        images: {
          create: [
            { url: mainImageUrl, isMain: true, sortOrder: 0 },
            ...galleryUrls.map((url, index) => ({
              url,
              isMain: false,
              sortOrder: index + 1,
            })),
          ],
        },
      },
    });

    return NextResponse.json({ success: true, id: villa.id });
  } catch (error) {
    console.error("Create villa error:", error);
    return NextResponse.json({ error: "Failed to create villa" }, { status: 500 });
  }
}
