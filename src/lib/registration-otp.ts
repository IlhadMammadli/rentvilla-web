import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "./prisma";
import { hashPassword, normalizePhone } from "./auth";
import { sendRegistrationOtpEmail } from "./email";
import { UserRole } from "@prisma/client";

const CODE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_LOGO = "/logo-default.svg";

export type PendingRegistration = {
  customerType: "villa_owner" | "realtor";
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  companyLogo?: string;
};

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendRegistrationOtp(formData: FormData) {
  const customerType = formData.get("customerType") as string;
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters", status: 400 as const };
  }

  const passwordHash = await hashPassword(password);
  let email = "";
  let payload: PendingRegistration;

  if (customerType === "villa_owner") {
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = normalizePhone(String(formData.get("phone") ?? ""));

    if (!firstName || !lastName || !email || phone.length < 12) {
      return { error: "Please fill all required fields", status: 400 as const };
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return { error: "Email or phone already registered", status: 400 as const };
    }

    payload = {
      customerType: "villa_owner",
      passwordHash,
      firstName,
      lastName,
      phone,
    };
  } else if (customerType === "realtor") {
    const companyName = String(formData.get("companyName") ?? "").trim();
    email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = normalizePhone(String(formData.get("phone") ?? ""));
    const logoFile = formData.get("companyLogo") as File | null;

    if (!companyName || !email || phone.length < 12) {
      return { error: "Please fill all required fields", status: 400 as const };
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return { error: "Email or phone already registered", status: 400 as const };
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

    payload = {
      customerType: "realtor",
      passwordHash,
      companyName,
      phone,
      companyLogo,
    };
  } else {
    return { error: "Invalid customer type", status: 400 as const };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  try {
    await prisma.registrationOtp.upsert({
      where: { email },
      create: {
        email,
        code,
        payload: JSON.stringify(payload),
        expiresAt,
      },
      update: {
        code,
        payload: JSON.stringify(payload),
        expiresAt,
      },
    });
  } catch (dbError) {
    console.error("[RentVilla] RegistrationOtp DB error:", dbError);
    return {
      error: "Registration verification is unavailable. Run prisma db push on production.",
      status: 503 as const,
    };
  }

  const mailResult = await sendRegistrationOtpEmail(email, code);

  if (!mailResult.sent && mailResult.error) {
    await prisma.registrationOtp.deleteMany({ where: { email } });
    return {
      error: "Could not send verification email. Check SMTP settings.",
      status: 503 as const,
      detail: mailResult.error,
    };
  }

  return {
    success: true,
    email,
    ...(!mailResult.sent && "devCode" in mailResult && mailResult.devCode
      ? { devCode: mailResult.devCode }
      : {}),
  };
}

export async function completeRegistrationWithOtp(emailRaw: string, codeRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const code = codeRaw.trim();

  if (!email || !code) {
    return { error: "Email and verification code are required", status: 400 as const };
  }

  const record = await prisma.registrationOtp.findUnique({ where: { email } });

  if (!record || record.code !== code || record.expiresAt < new Date()) {
    return { error: "Invalid or expired verification code", status: 400 as const };
  }

  let pending: PendingRegistration;
  try {
    pending = JSON.parse(record.payload) as PendingRegistration;
  } catch {
    return { error: "Invalid registration data", status: 400 as const };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.registrationOtp.deleteMany({ where: { email } });
    return { error: "Email already registered", status: 400 as const };
  }

  let user;

  if (pending.customerType === "villa_owner") {
    user = await prisma.user.create({
      data: {
        email,
        phone: pending.phone!,
        passwordHash: pending.passwordHash,
        role: UserRole.VILLA_OWNER,
        villaOwnerProfile: {
          create: {
            firstName: pending.firstName!,
            lastName: pending.lastName!,
            phone: pending.phone!,
          },
        },
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        phone: pending.phone!,
        passwordHash: pending.passwordHash,
        role: UserRole.REALTOR,
        realtorProfile: {
          create: {
            companyName: pending.companyName!,
            companyLogo: pending.companyLogo ?? DEFAULT_LOGO,
            phone: pending.phone!,
          },
        },
      },
    });
  }

  await prisma.registrationOtp.deleteMany({ where: { email } });

  return { success: true, role: user.role, userId: user.id };
}
