import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordVillaView } from "@/lib/analytics";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const villa = await prisma.villa.findUnique({
    where: { id, isPublished: true },
    select: { id: true },
  });

  if (!villa) {
    return NextResponse.json({ error: "Villa not found" }, { status: 404 });
  }

  let visitorId: string | undefined;
  try {
    const body = await request.json();
    visitorId = body.visitorId;
  } catch {
    visitorId = undefined;
  }

  await recordVillaView(id, visitorId);
  return NextResponse.json({ success: true });
}
