import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; districtId: string }> }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cityId, districtId } = await params;

  const district = await prisma.cityDistrict.findFirst({
    where: { id: districtId, cityId },
  });
  if (!district) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.cityDistrict.delete({ where: { id: districtId } });
  return NextResponse.json({ success: true });
}
