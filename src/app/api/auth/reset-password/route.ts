import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithCode } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();
    const result = await resetPasswordWithCode(
      String(email ?? ""),
      String(code ?? ""),
      String(password ?? "")
    );
    if ("error" in result && "status" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
