"use client";

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

/** Object storage configured for villa photos (CDN base URL exposed to client). */
export function hasObjectStorageUpload(): boolean {
  return Boolean(cleanEnv(process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL));
}

/** @deprecated Browser→Spaces signed PUT needs CORS; use server upload instead. */
export function hasSignedUploadConfig(): boolean {
  return (
    cleanEnv(process.env.NEXT_PUBLIC_S3_UPLOAD_MODE) === "signed" &&
    hasObjectStorageUpload()
  );
}

/**
 * Upload via your API → DigitalOcean Spaces (no CORS issues in browser).
 */
export async function uploadImageToObjectStorage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/uploads/direct", {
    method: "POST",
    body: formData,
  });

  let data: { error?: string; publicUrl?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error("Upload response invalid");
  }

  if (!res.ok || !data.publicUrl) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }

  return data.publicUrl;
}
