"use client";

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function hasSignedUploadConfig(): boolean {
  return (
    cleanEnv(process.env.NEXT_PUBLIC_S3_UPLOAD_MODE) === "signed" &&
    Boolean(cleanEnv(process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL))
  );
}

export async function uploadImageWithSignedUrl(file: File): Promise<string> {
  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "image/jpeg",
      size: file.size,
    }),
  });

  const signData = (await signRes.json()) as {
    error?: string;
    uploadUrl?: string;
    publicUrl?: string;
    method?: string;
    headers?: Record<string, string>;
  };

  if (!signRes.ok || !signData.uploadUrl || !signData.publicUrl) {
    throw new Error(signData.error || "Failed to sign upload");
  }

  const uploadRes = await fetch(signData.uploadUrl, {
    method: signData.method || "PUT",
    headers: signData.headers ?? { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Object storage upload failed");
  }

  return signData.publicUrl;
}

