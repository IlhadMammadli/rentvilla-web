import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, canAssignSiteManager } from "@/lib/admin-api";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const actor = await requireAdminApi();
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, userId } = await request.json();

  if (!email && !userId) {
    return NextResponse.json(
      { error: "Provide email or userId" },
      { status: 400 }
    );
  }

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot modify admin" }, { status: 400 });
  }

  if (!canAssignSiteManager(actor.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.SITE_MANAGER, isBlocked: false },
  });

  return NextResponse.json({
    success: true,
    userId: user.id,
    email: user.email,
  });
}

export async function DELETE(request: NextRequest) {
  const actor = await requireAdminApi();
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, userId, restoreRole } = await request.json();
  const role = (restoreRole as UserRole) ?? UserRole.VILLA_OWNER;

  if (!["VILLA_OWNER", "REALTOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid restore role" }, { status: 400 });
  }

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });

  if (!user || user.role !== "SITE_MANAGER") {
    return NextResponse.json({ error: "Site manager not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
