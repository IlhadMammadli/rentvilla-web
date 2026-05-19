import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmed = name.trim();
  const slug = slugify(trimmed);

  try {
    const facility = await prisma.facility.create({
      data: { name: trimmed, slug },
      select: { id: true, name: true },
    });
    return NextResponse.json(facility);
  } catch {
    return NextResponse.json({ error: "Facility already exists" }, { status: 400 });
  }
}
