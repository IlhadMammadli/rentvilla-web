import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordResetCode } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    const result = await verifyPasswordResetCode(
      String(email ?? ""),
      String(code ?? "")
    );
    if ("error" in result && "status" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
