import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSessionUser } from "@/lib/auth";
import { canListVillas } from "@/lib/roles";
import { getObjectStorageConfig } from "@/lib/object-storage";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

function extensionFromMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || !canListVillas(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileName, contentType, size } = (await request.json()) as {
      fileName?: string;
      contentType?: string;
      size?: number;
    };

    if (!contentType || !ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    if (!size || size <= 0 || size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Max size is 10MB." },
        { status: 400 }
      );
    }

    const storage = getObjectStorageConfig();
    if (!storage.isConfigured) {
      return NextResponse.json(
        { error: "Object storage is not configured on server." },
        { status: 503 }
      );
    }

    const safeBaseName = (fileName ?? "villa")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40);
    const key = `rentvilla/villas/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeBaseName}.${extensionFromMime(contentType)}`;

    const client = new S3Client({
      region: storage.region,
      endpoint: storage.endpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    const publicUrl = `${storage.publicBaseUrl.replace(/\/+$/, "")}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Sign upload error:", error);
    return NextResponse.json({ error: "Failed to prepare upload" }, { status: 500 });
  }
}

