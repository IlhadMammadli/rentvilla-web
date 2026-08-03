import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canListVillas } from "@/lib/roles";
import { createPromotionOrder } from "@/lib/promotions";
import { PromotionLevel, PromotionTier, PromotionType } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["VILLA", "PROFILE"]),
  tier: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  level: z.enum(["STANDARD", "VIP"]).optional(),
  villaId: z.string().optional(),
  highlightedVillaIds: z.array(z.string()).optional(),
  language: z.enum(["AZ", "EN", "RU"]).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const result = await createPromotionOrder({
      userId: session.id,
      userRole: session.role,
      type: parsed.data.type as PromotionType,
      tier: parsed.data.tier as PromotionTier,
      level: (parsed.data.level as PromotionLevel | undefined) ?? PromotionLevel.STANDARD,
      villaId: parsed.data.villaId,
      highlightedVillaIds: parsed.data.highlightedVillaIds,
      language: parsed.data.language,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}
