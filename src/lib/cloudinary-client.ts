"use client";

function clean(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function hasPublicCloudinaryConfig(): boolean {
  return Boolean(
    clean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
      clean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
  );
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = clean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const uploadPreset = clean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  if (!cloudName || !uploadPreset) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "rentvilla");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
