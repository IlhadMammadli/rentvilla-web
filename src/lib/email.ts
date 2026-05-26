import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const from = process.env.SMTP_FROM ?? "RentVilla <noreply@rentvilla.az>";
  const transport = getTransport();

  if (!transport) {
    console.log(`[RentVilla] Password reset code for ${to}: ${code}`);
    return { sent: false, devCode: code };
  }

  await transport.sendMail({
    from,
    to,
    subject: "RentVilla — Password reset code",
    text: `Your verification code is: ${code}\n\nIt expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#111">Reset your password</h2>
        <p>Enter this verification code on RentVilla:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111">${code}</p>
        <p style="color:#666;font-size:14px">Expires in 15 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
}
