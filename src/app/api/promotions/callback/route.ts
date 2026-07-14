import { NextRequest, NextResponse } from "next/server";
import { handlePayriffCallback } from "@/lib/promotions";
import { getSiteBaseUrl } from "@/lib/payriff";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await handlePayriffCallback(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const promotionId =
      (body.promotionId as string) ||
      ((body.metadata as Record<string, string> | undefined)?.promotionId ?? "");

    return NextResponse.json({ success: true, promotionId });
  } catch (error) {
    console.error("Promotion callback error:", error);
    return NextResponse.json({ error: "Callback failed" }, { status: 500 });
  }
}

/** Payriff may redirect the user back via GET after payment */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const promotionId = searchParams.get("promotionId") ?? "";
  const orderId = searchParams.get("orderId") ?? searchParams.get("orderID") ?? "";

  const baseUrl = getSiteBaseUrl();

  if (!promotionId && !orderId) {
    return NextResponse.redirect(`${baseUrl}/dashboard/promote?payment=unknown`);
  }

  const result = await handlePayriffCallback({
    promotionId,
    orderId,
  });

  if ("error" in result) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/promote?payment=failed&promotionId=${promotionId}`
    );
  }

  const id =
    "promotionId" in result && typeof result.promotionId === "string"
      ? result.promotionId
      : promotionId;
  return NextResponse.redirect(`${baseUrl}/dashboard/promotions/${id}?payment=success`);
}
