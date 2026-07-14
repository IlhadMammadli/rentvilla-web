import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canListVillas } from "@/lib/roles";
import { getPromotionForUser, verifyAndActivatePromotion } from "@/lib/promotions";
import { getPromotionStats } from "@/lib/promotion-analytics";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const promotion = await getPromotionForUser(id, session.id);

  if (!promotion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stats = await getPromotionStats(id, session.id);

  return NextResponse.json({ promotion, stats });
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const promotion = await getPromotionForUser(id, session.id);

  if (!promotion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await verifyAndActivatePromotion(id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const stats = await getPromotionStats(id, session.id);
  return NextResponse.json({ success: true, stats });
}
