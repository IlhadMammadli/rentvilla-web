import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cityId } = await params;
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    return NextResponse.json({ error: "City not found" }, { status: 404 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const district = await prisma.cityDistrict.create({
      data: { cityId, name: name.trim() },
      select: { id: true, name: true, cityId: true },
    });
    return NextResponse.json(district);
  } catch {
    return NextResponse.json(
      { error: "District already exists for this city" },
      { status: 400 }
    );
  }
}
