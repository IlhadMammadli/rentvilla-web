import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canListVillas } from "@/lib/roles";
import { getUserPromotions } from "@/lib/promotions";

export async function GET() {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const promotions = await getUserPromotions(session.id);
  return NextResponse.json({ promotions });
}
