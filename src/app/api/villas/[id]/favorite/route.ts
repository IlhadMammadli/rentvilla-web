import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addVillaFavorite, removeVillaFavorite } from "@/lib/favorites";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id: villaId } = await params;
  const result = await addVillaFavorite(user.id, villaId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id: villaId } = await params;
  await removeVillaFavorite(user.id, villaId);
  return NextResponse.json({ success: true });
}
