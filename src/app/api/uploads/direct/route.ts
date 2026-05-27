import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSessionUser } from "@/lib/auth";
import { canListVillas } from "@/lib/roles";
import { getObjectStorageConfig } from "@/lib/object-storage";
import {
  extensionFromContentType,
  isAllowedImageContentType,
  normalizeImageContentType,
} from "@/lib/image-upload";

/** Netlify request body limit is ~6MB; keep under that. */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const storage = getObjectStorageConfig();
    if (!storage.isConfigured) {
      return NextResponse.json(
        { error: "Object storage is not configured on server." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Max size is 5MB." },
        { status: 400 }
      );
    }

    const contentType = normalizeImageContentType(file);
    if (!isAllowedImageContentType(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40);
    const key = `rentvilla/villas/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeBaseName}.${extensionFromContentType(contentType)}`;

    const bytes = await file.arrayBuffer();
    const useAcl = process.env.S3_SKIP_ACL !== "true";

    const client = new S3Client({
      region: storage.region,
      endpoint: storage.endpoint,
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    await client.send(
      new PutObjectCommand({
        Bucket: storage.bucket,
        Key: key,
        Body: Buffer.from(bytes),
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
        ...(useAcl ? { ACL: "public-read" as const } : {}),
      })
    );

    const publicUrl = `${storage.publicBaseUrl.replace(/\/+$/, "")}/${key}`;
    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Direct upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
