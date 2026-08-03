import { NextRequest, NextResponse } from "next/server";
import { handlePayriffCallback } from "@/lib/promotions";
import { getSiteBaseUrl } from "@/lib/payriff";

function resultRedirect(
  baseUrl: string,
  status: "success" | "failed" | "unknown",
  promotionId?: string
) {
  const params = new URLSearchParams({ status });
  if (promotionId) params.set("promotionId", promotionId);
  return NextResponse.redirect(`${baseUrl}/dashboard/promote/result?${params.toString()}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await handlePayriffCallback(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, promotionId: result.promotionId });
  } catch (error) {
    console.error("Promotion callback error:", error);
    return NextResponse.json({ error: "Callback failed" }, { status: 500 });
  }
}

/** Payriff redirects the user back here after payment (GET). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const promotionId =
    searchParams.get("promotionId") ||
    searchParams.get("promoId") ||
    "";
  const orderId =
    searchParams.get("orderId") ||
    searchParams.get("orderID") ||
    searchParams.get("id") ||
    "";

  const baseUrl = getSiteBaseUrl();

  if (!promotionId && !orderId) {
    return resultRedirect(baseUrl, "unknown");
  }

  const result = await handlePayriffCallback({
    promotionId,
    orderId,
  });

  if ("error" in result) {
    return resultRedirect(baseUrl, "failed", promotionId || undefined);
  }

  return resultRedirect(baseUrl, "success", result.promotionId);
}
