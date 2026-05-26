import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getStaffFromRequest,
  requireAdminApi,
  assertCanModifyUser,
  canBlockUser,
  canDeleteUser,
  canAssignSiteManager,
  canPromoteRealtor,
} from "@/lib/admin-api";
import { UserRole } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getStaffFromRequest();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const check = await assertCanModifyUser(actor.role, id, actor.id);
  if ("error" in check && "status" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }
  const { target } = check;

  const body = await request.json();

  if (body.isBlocked !== undefined) {
    if (!canBlockUser(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.user.update({
      where: { id },
      data: { isBlocked: Boolean(body.isBlocked) },
    });
  }

  if (body.promoteCompany !== undefined) {
    if (!canPromoteRealtor(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (target.role !== "REALTOR") {
      return NextResponse.json({ error: "User is not a realtor" }, { status: 400 });
    }
    await prisma.realtorProfile.update({
      where: { userId: id },
      data: { isPromoted: Boolean(body.promoteCompany) },
    });
  }

  if (body.role !== undefined) {
    if (!canAssignSiteManager(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const role = body.role as UserRole;
    if (!["SITE_MANAGER", "VILLA_OWNER", "REALTOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot change admin role" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await requireAdminApi();
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const check = await assertCanModifyUser(actor.role, id, actor.id);
  if ("error" in check && "status" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  if (!canDeleteUser(actor.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
