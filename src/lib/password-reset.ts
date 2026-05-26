import { prisma } from "./prisma";
import { hashPassword } from "./auth";
import { sendPasswordResetEmail } from "./email";

const CODE_TTL_MS = 15 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestPasswordReset(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { error: "Email is required", status: 400 as const };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true, message: "If an account exists, a code was sent." };
  }

  await prisma.passwordResetCode.deleteMany({ where: { email } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.passwordResetCode.create({
    data: { email, code, expiresAt },
  });

  const mailResult = await sendPasswordResetEmail(email, code);

  return {
    success: true,
    message: "If an account exists, a code was sent.",
    ...(mailResult.devCode ? { devCode: mailResult.devCode } : {}),
  };
}

export async function verifyPasswordResetCode(emailRaw: string, codeRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const code = codeRaw.trim();

  if (!email || !code) {
    return { error: "Email and code are required", status: 400 as const };
  }

  const record = await prisma.passwordResetCode.findFirst({
    where: { email, code },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return { error: "Invalid or expired code", status: 400 as const };
  }

  return { success: true, verified: true };
}

export async function resetPasswordWithCode(
  emailRaw: string,
  codeRaw: string,
  password: string
) {
  const email = emailRaw.trim().toLowerCase();
  const code = codeRaw.trim();

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters", status: 400 as const };
  }

  const verify = await verifyPasswordResetCode(email, code);
  if ("error" in verify) return verify;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Account not found", status: 404 as const };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await prisma.passwordResetCode.deleteMany({ where: { email } });

  return { success: true };
}
