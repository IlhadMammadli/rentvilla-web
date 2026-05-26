import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserFavorites } from "@/lib/favorites";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await getUserFavorites(user.id);
  return NextResponse.json({
    favorites: favorites.map((f) => ({
      villaId: f.villaId,
      createdAt: f.createdAt,
      villa: f.villa,
    })),
  });
}
