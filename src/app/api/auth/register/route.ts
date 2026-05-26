import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  normalizePhone,
} from "@/lib/auth";
import { UserRole } from "@prisma/client";

const DEFAULT_LOGO = "/logo-default.svg";

async function registerPerson(
  formData: FormData,
  passwordHash: string,
  role: UserRole,
  profileKey: "villaOwnerProfile" | "guestProfile"
) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));

  if (!firstName || !lastName || !email || phone.length < 12) {
    return NextResponse.json(
      { error: "Please fill all required fields" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email or phone already registered" },
      { status: 400 }
    );
  }

  const profileData = { firstName, lastName, phone };
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role,
      ...(profileKey === "villaOwnerProfile"
        ? { villaOwnerProfile: { create: profileData } }
        : { guestProfile: { create: profileData } }),
    },
  });

  await createSession(user.id);
  return NextResponse.json({ success: true, role: user.role });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const customerType = formData.get("customerType") as string;
    const password = String(formData.get("password") ?? "");

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    if (customerType === "villa_owner") {
      return registerPerson(formData, passwordHash, UserRole.VILLA_OWNER, "villaOwnerProfile");
    }

    if (customerType === "realtor") {
      const companyName = String(formData.get("companyName") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim().toLowerCase();
      const phone = normalizePhone(String(formData.get("phone") ?? ""));
      const logoFile = formData.get("companyLogo") as File | null;

      if (!companyName || !email || phone.length < 12) {
        return NextResponse.json(
          { error: "Please fill all required fields" },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Email or phone already registered" },
          { status: 400 }
        );
      }

      let companyLogo = DEFAULT_LOGO;
      if (logoFile && logoFile.size > 0) {
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(logoFile.name) || ".png";
        const filename = `logo-${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        companyLogo = `/uploads/logos/${filename}`;
      }

      const user = await prisma.user.create({
        data: {
          email,
          phone,
          passwordHash,
          role: UserRole.REALTOR,
          realtorProfile: {
            create: { companyName, companyLogo, phone },
          },
        },
      });

      await createSession(user.id);
      return NextResponse.json({ success: true, role: user.role });
    }

    return NextResponse.json({ error: "Invalid customer type" }, { status: 400 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
