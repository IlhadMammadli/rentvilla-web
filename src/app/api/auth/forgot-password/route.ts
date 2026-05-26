import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const result = await requestPasswordReset(String(email ?? ""));
    if ("error" in result && "status" in result) {
      return NextResponse.json(
        {
          error: result.error,
          ...(process.env.NODE_ENV !== "production" && "detail" in result
            ? { detail: result.detail }
            : {}),
        },
        { status: result.status }
      );
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
