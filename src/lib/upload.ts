import { writeFile, mkdir } from "fs/promises";
import path from "path";

const VILLA_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "villas");

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function hasCloudinaryConfig(): boolean {
  return Boolean(
    cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) &&
      cleanEnv(process.env.CLOUDINARY_UPLOAD_PRESET)
  );
}

/** Netlify/Vercel cannot persist files under public/uploads. */
export function requiresCloudStorage(): boolean {
  if (process.env.USE_LOCAL_UPLOADS === "true") return false;
  return Boolean(
    process.env.NETLIFY === "true" ||
      process.env.VERCEL === "1" ||
      process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

async function saveToLocalDisk(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `villa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await mkdir(VILLA_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(VILLA_UPLOAD_DIR, filename), buffer);
  return `/uploads/villas/${filename}`;
}

async function saveToCloudinary(file: File): Promise<string> {
  const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const uploadPreset = cleanEnv(process.env.CLOUDINARY_UPLOAD_PRESET);

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

export async function saveVillaImage(file: File): Promise<string> {
  if (hasCloudinaryConfig()) {
    return saveToCloudinary(file);
  }

  if (requiresCloudStorage()) {
    throw new Error(
      "Cannot save images on this server. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to environment variables (see docs/NETLIFY.md)."
    );
  }

  return saveToLocalDisk(file);
}
