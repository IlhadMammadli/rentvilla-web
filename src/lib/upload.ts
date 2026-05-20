import { writeFile, mkdir } from "fs/promises";
import path from "path";

const VILLA_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "villas");

export async function saveVillaImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `villa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await mkdir(VILLA_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(VILLA_UPLOAD_DIR, filename), buffer);
  return `/uploads/villas/${filename}`;
}
