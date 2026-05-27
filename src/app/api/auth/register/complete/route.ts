import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { completeRegistrationWithOtp } from "@/lib/registration-otp";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    const result = await completeRegistrationWithOtp(String(email ?? ""), String(code ?? ""));

    if ("error" in result && "status" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await createSession(result.userId);
    return NextResponse.json({ success: true, role: result.role });
  } catch (error) {
    console.error("Complete registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
