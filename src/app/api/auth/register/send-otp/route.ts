import { NextRequest, NextResponse } from "next/server";
import { sendRegistrationOtp } from "@/lib/registration-otp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await sendRegistrationOtp(formData);

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
      email: result.email,
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  } catch (error) {
    console.error("Send registration OTP error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
