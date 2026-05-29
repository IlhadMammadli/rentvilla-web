import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/constants";

function cleanEnv(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

function getTransport() {
  const host = cleanEnv(process.env.SMTP_HOST);
  const user = cleanEnv(process.env.SMTP_USER);
  const pass = cleanEnv(process.env.SMTP_PASS).replace(/\s/g, "");

  if (!host || !user || !pass) return null;

  const port = Number(cleanEnv(process.env.SMTP_PORT) || "587");
  const secure = cleanEnv(process.env.SMTP_SECURE) === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure && port === 587,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
}

export type SendEmailResult =
  | { sent: true }
  | { sent: false; devCode?: string; error?: string };

export async function sendRegistrationOtpEmail(
  to: string,
  code: string
): Promise<SendEmailResult> {
  const user = cleanEnv(process.env.SMTP_USER);
  const from =
    cleanEnv(process.env.SMTP_FROM) || (user ? `${SITE_NAME} <${user}>` : `${SITE_NAME} <noreply@villahub.az>`);
  const transport = getTransport();

  if (!transport) {
    console.log(`[${SITE_NAME}] Registration OTP for ${to}: ${code}`);
    return { sent: false, devCode: code };
  }

  try {
    await transport.sendMail({
      from,
      to,
      subject: `${SITE_NAME} — Verify your email`,
      text: `Your registration code is: ${code}\n\nEnter this code to complete your ${SITE_NAME} account. Expires in 15 minutes.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#111">Verify your email</h2>
          <p>Enter this code to finish creating your ${SITE_NAME} account:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111">${code}</p>
          <p style="color:#666;font-size:14px">Expires in 15 minutes. If you did not sign up, ignore this email.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMTP send failed";
    console.error(`[${SITE_NAME}] SMTP registration OTP error:`, message, error);
    return { sent: false, error: message };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  code: string
): Promise<SendEmailResult> {
  const user = cleanEnv(process.env.SMTP_USER);
  const from =
    cleanEnv(process.env.SMTP_FROM) || (user ? `${SITE_NAME} <${user}>` : `${SITE_NAME} <noreply@villahub.az>`);
  const transport = getTransport();

  if (!transport) {
    console.log(`[${SITE_NAME}] Password reset code for ${to}: ${code}`);
    return { sent: false, devCode: code };
  }

  try {
    await transport.sendMail({
      from,
      to,
      subject: `${SITE_NAME} — Password reset code`,
      text: `Your verification code is: ${code}\n\nIt expires in 15 minutes. If you did not request this, ignore this email.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#111">Reset your password</h2>
          <p>Enter this verification code on ${SITE_NAME}:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111">${code}</p>
          <p style="color:#666;font-size:14px">Expires in 15 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMTP send failed";
    console.error(`[${SITE_NAME}] SMTP error:`, message, error);
    return { sent: false, error: message };
  }
}
