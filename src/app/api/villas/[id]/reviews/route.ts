import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getVillaReviews,
  upsertVillaReview,
  displayReviewerName,
} from "@/lib/villa-reviews";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviews = await getVillaReviews(id);
  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      authorName: displayReviewerName(r.user),
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const rating = parseInt(String(body.rating ?? "0"), 10);
  const comment = body.comment != null ? String(body.comment) : undefined;

  const result = await upsertVillaReview(id, session.id, rating, comment);
  if ("error" in result && "status" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
