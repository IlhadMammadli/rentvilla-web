import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, normalizePhone } from "@/lib/auth";
import { ensureVillaOwnerProfile } from "@/lib/ensure-owner-profile";
import { canListVillas } from "@/lib/roles";
import { saveVillaImage } from "@/lib/upload";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import {
  isAllowedImageUrl,
  mapVillaCreateError,
  type VillaCreateFields,
} from "@/lib/villa-create";
import { PricePeriod } from "@prisma/client";

function parseFields(body: Record<string, unknown>): VillaCreateFields | null {
  const title = String(body.title ?? "").trim();
  const cityId = String(body.cityId ?? "");
  const districtId = String(body.districtId ?? "").trim() || null;
  const price = parseFloat(String(body.price ?? "0"));
  const pricePeriod = String(body.pricePeriod ?? "DAILY") as "DAILY" | "MONTHLY";
  const guestCount = parseInt(String(body.guestCount ?? "0"), 10);
  const roomCount = parseInt(String(body.roomCount ?? "0"), 10);
  const contactName = String(body.contactName ?? "").trim();
  const contactPhone = normalizePhone(String(body.contactPhone ?? ""));
  const description = String(body.description ?? "").trim();
  const address = String(body.address ?? "").trim();
  const isAFrame = body.isAFrame === true || body.isAFrame === "true";
  const facilityIds = Array.isArray(body.facilityIds)
    ? body.facilityIds.map(String)
    : [];

  if (
    !title ||
    !cityId ||
    !price ||
    !guestCount ||
    !roomCount ||
    !contactName ||
    !description
  ) {
    return null;
  }

  return {
    title,
    cityId,
    districtId,
    price,
    pricePeriod,
    guestCount,
    roomCount,
    contactName,
    contactPhone,
    description,
    address,
    isAFrame,
    facilityIds,
  };
}

async function validateDistrict(cityId: string, districtId: string | null) {
  if (!districtId) return null;
  const district = await prisma.cityDistrict.findFirst({
    where: { id: districtId, cityId, isActive: true },
  });
  if (!district) return "Invalid district";
  return null;
}

async function createVillaRecord(
  userId: string,
  fields: VillaCreateFields,
  mainImageUrl: string,
  galleryUrls: string[]
) {
  return prisma.villa.create({
    data: {
      userId,
      cityId: fields.cityId,
      districtId: fields.districtId,
      title: fields.title,
      description: fields.description,
      price: fields.price,
      pricePeriod:
        fields.pricePeriod === "MONTHLY" ? PricePeriod.MONTHLY : PricePeriod.DAILY,
      guestCount: fields.guestCount,
      roomCount: fields.roomCount,
      contactName: fields.contactName,
      contactPhone: fields.contactPhone,
      address: fields.address || null,
      isAFrame: fields.isAFrame,
      imageUrl: mainImageUrl,
      facilities: {
        create: fields.facilityIds.map((facilityId) => ({ facilityId })),
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
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "GUEST") {
    await ensureVillaOwnerProfile(session.id);
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      const fields = parseFields(body);
      if (!fields) {
        return NextResponse.json(
          { error: "Please fill all required fields" },
          { status: 400 }
        );
      }

      const mainImageUrl = String(body.mainImageUrl ?? "").trim();
      const galleryUrls = (Array.isArray(body.galleryUrls) ? body.galleryUrls : [])
        .map(String)
        .slice(0, MAX_GALLERY_IMAGES);

      if (!mainImageUrl || !isAllowedImageUrl(mainImageUrl)) {
        return NextResponse.json({ error: "Main photo is required" }, { status: 400 });
      }

      if (galleryUrls.some((url) => !isAllowedImageUrl(url))) {
        throw new Error("Invalid image URL");
      }

      const districtError = await validateDistrict(fields.cityId, fields.districtId);
      if (districtError) {
        return NextResponse.json({ error: districtError }, { status: 400 });
      }

      const villa = await createVillaRecord(
        session.id,
        fields,
        mainImageUrl,
        galleryUrls
      );
      return NextResponse.json({ success: true, id: villa.id });
    }

    const formData = await request.formData();
    const fields = parseFields({
      title: formData.get("title"),
      cityId: formData.get("cityId"),
      districtId: formData.get("districtId"),
      price: formData.get("price"),
      pricePeriod: formData.get("pricePeriod"),
      guestCount: formData.get("guestCount"),
      roomCount: formData.get("roomCount"),
      contactName: formData.get("contactName"),
      contactPhone: formData.get("contactPhone"),
      description: formData.get("description"),
      address: formData.get("address"),
      isAFrame: formData.get("isAFrame"),
      facilityIds: formData.getAll("facilityIds"),
    });

    if (!fields) {
      return NextResponse.json(
        { error: "Please fill all required fields" },
        { status: 400 }
      );
    }

    const mainImageFile = formData.get("mainImage") as File | null;
    const galleryFiles = formData
      .getAll("galleryImages")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_GALLERY_IMAGES);

    if (!mainImageFile || mainImageFile.size === 0) {
      return NextResponse.json({ error: "Main photo is required" }, { status: 400 });
    }

    const districtError = await validateDistrict(fields.cityId, fields.districtId);
    if (districtError) {
      return NextResponse.json({ error: districtError }, { status: 400 });
    }

    const mainImageUrl = await saveVillaImage(mainImageFile);
    const galleryUrls = await Promise.all(galleryFiles.map(saveVillaImage));

    const villa = await createVillaRecord(
      session.id,
      fields,
      mainImageUrl,
      galleryUrls
    );

    return NextResponse.json({ success: true, id: villa.id });
  } catch (error) {
    console.error("Create villa error:", error);
    const mapped = mapVillaCreateError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
