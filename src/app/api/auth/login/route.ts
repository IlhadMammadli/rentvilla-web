import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, normalizePhone, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { loginType, email, phone, password } = parsed.data;

    let user;
    if (loginType === "email") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } else {
      if (!phone) {
        return NextResponse.json({ error: "Phone is required" }, { status: 400 });
      }
      const normalized = normalizePhone(phone);
      user = await prisma.user.findUnique({
        where: { phone: normalized },
      });
    }

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    await createSession(user.id);
    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
