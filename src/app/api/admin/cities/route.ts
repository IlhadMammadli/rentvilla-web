import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const city = await prisma.city.create({
      data: { name: name.trim() },
      select: { id: true, name: true },
    });
    return NextResponse.json(city);
  } catch {
    return NextResponse.json({ error: "City already exists" }, { status: 400 });
  }
}
