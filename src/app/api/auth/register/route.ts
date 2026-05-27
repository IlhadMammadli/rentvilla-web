import { NextResponse } from "next/server";

/** Registration now uses send-otp + complete with email verification. */
export async function POST() {
  return NextResponse.json(
    { error: "Use email verification. Request a code first." },
    { status: 400 }
  );
}
