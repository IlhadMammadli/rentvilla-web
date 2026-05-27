"use client";

import { normalizeImageContentType } from "@/lib/image-upload";

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
  const contentType = normalizeImageContentType(file);

  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      size: file.size,
    }),
  });

  let signData: {
    error?: string;
    uploadUrl?: string;
    publicUrl?: string;
    method?: string;
    headers?: Record<string, string>;
  };

  try {
    signData = await signRes.json();
  } catch {
    throw new Error("Upload sign response invalid");
  }

  if (!signRes.ok || !signData.uploadUrl || !signData.publicUrl) {
    throw new Error(signData.error || `Upload sign failed (${signRes.status})`);
  }

  const uploadRes = await fetch(signData.uploadUrl, {
    method: signData.method || "PUT",
    headers: signData.headers ?? { "Content-Type": contentType },
    body: file,
  });

  if (!uploadRes.ok) {
    const detail = await uploadRes.text().catch(() => "");
    const hint =
      uploadRes.status === 403
        ? " (check Spaces CORS and x-amz-acl headers)"
        : uploadRes.status === 0
          ? " (possible CORS block — add your site URL to Space CORS)"
          : "";
    throw new Error(
      `Photo upload to storage failed (${uploadRes.status})${hint}${detail ? `: ${detail.slice(0, 120)}` : ""}`
    );
  }

  return signData.publicUrl;
}
