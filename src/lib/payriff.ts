function cleanEnv(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

export function isPayriffConfigured() {
  return Boolean(cleanEnv(process.env.PAYRIFF_SECRET_KEY));
}

export function getSiteBaseUrl() {
  const fromEnv = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || cleanEnv(process.env.SITE_URL);
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.URL) return process.env.URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

type PayriffCreateOrderResponse = {
  code: string;
  message: string;
  payload?: {
    orderId: string;
    paymentUrl: string;
    transactionId?: number;
  };
};

type PayriffOrderInfoResponse = {
  code: string;
  message: string;
  payload?: {
    orderId: string;
    amount: number;
    paymentStatus: string;
    description?: string;
  };
};

const PAYRIFF_API = "https://api.payriff.com/api/v3";

export async function createPayriffOrder(input: {
  amount: number;
  description: string;
  callbackUrl: string;
  metadata: Record<string, string>;
  language?: "AZ" | "EN" | "RU";
}) {
  const secretKey = cleanEnv(process.env.PAYRIFF_SECRET_KEY);
  if (!secretKey) {
    return { error: "Payment gateway is not configured", status: 503 as const };
  }

  const res = await fetch(`${PAYRIFF_API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: secretKey,
    },
    body: JSON.stringify({
      amount: input.amount,
      language: input.language ?? "AZ",
      currency: "AZN",
      description: input.description,
      callbackUrl: input.callbackUrl,
      cardSave: false,
      operation: "PURCHASE",
      metadata: input.metadata,
    }),
  });

  const data = (await res.json()) as PayriffCreateOrderResponse;

  if (!res.ok || data.code !== "00000" || !data.payload?.orderId || !data.payload?.paymentUrl) {
    console.error("[Payriff] create order failed:", data);
    return {
      error: data.message || "Failed to create payment order",
      status: 502 as const,
    };
  }

  return {
    success: true as const,
    orderId: data.payload.orderId,
    paymentUrl: data.payload.paymentUrl,
    transactionId: data.payload.transactionId,
  };
}

export async function getPayriffOrder(orderId: string) {
  const secretKey = cleanEnv(process.env.PAYRIFF_SECRET_KEY);
  if (!secretKey) {
    return { error: "Payment gateway is not configured", status: 503 as const };
  }

  const res = await fetch(`${PAYRIFF_API}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: { Authorization: secretKey },
    cache: "no-store",
  });

  const data = (await res.json()) as PayriffOrderInfoResponse;

  if (!res.ok || data.code !== "00000" || !data.payload) {
    console.error("[Payriff] get order failed:", data);
    return { error: data.message || "Failed to verify payment", status: 502 as const };
  }

  return { success: true as const, order: data.payload };
}

export function isPayriffOrderPaid(paymentStatus: string) {
  return paymentStatus === "PAID" || paymentStatus === "APPROVED";
}
