import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getStaffFromRequest,
  requireAdminApi,
  canToggleVillaPublish,
  canPromoteVilla,
  canDeleteVilla,
} from "@/lib/admin-api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getStaffFromRequest();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const villa = await prisma.villa.findUnique({ where: { id } });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const data: { isPublished?: boolean; isPromoted?: boolean } = {};

  if (body.isPublished !== undefined) {
    if (!canToggleVillaPublish(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    data.isPublished = Boolean(body.isPublished);
  }

  if (body.isPromoted !== undefined) {
    if (!canPromoteVilla(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    data.isPromoted = Boolean(body.isPromoted);
  }

  await prisma.villa.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await requireAdminApi();
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!canDeleteVilla(actor.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.villa.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
