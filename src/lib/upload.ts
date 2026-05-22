import { writeFile, mkdir } from "fs/promises";
import path from "path";

const VILLA_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "villas");

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
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

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
  try {
    return await saveToLocalDisk(file);
  } catch (localError) {
    console.warn("Local image save failed, trying Cloudinary:", localError);
    try {
      return await saveToCloudinary(file);
    } catch (cloudError) {
      if (
        cloudError instanceof Error &&
        cloudError.message === "CLOUDINARY_NOT_CONFIGURED"
      ) {
        throw new Error(
          "Cannot save images on this server. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to environment variables (see docs/NETLIFY.md)."
        );
      }
      throw cloudError;
    }
  }
}
