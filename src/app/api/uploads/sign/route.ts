import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSessionUser } from "@/lib/auth";
import { canListVillas } from "@/lib/roles";
import { getObjectStorageConfig } from "@/lib/object-storage";
import {
  extensionFromContentType,
  isAllowedImageContentType,
} from "@/lib/image-upload";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

    const normalizedType =
      contentType === "image/jpg" ? "image/jpeg" : (contentType ?? "");

    if (!normalizedType || !isAllowedImageContentType(normalizedType)) {
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
        {
          error:
            "Object storage is not configured. Add S3_* variables on the server (Netlify env).",
        },
        { status: 503 }
      );
    }

    const safeBaseName = (fileName ?? "villa")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40);
    const key = `rentvilla/villas/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeBaseName}.${extensionFromContentType(normalizedType)}`;

    const useAcl = process.env.S3_SKIP_ACL !== "true";

    const client = new S3Client({
      region: storage.region,
      endpoint: storage.endpoint,
      forcePathStyle: false,
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
      // Browser PUT cannot send SDK checksum headers; omit from presigned URL
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    const command = new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      ContentType: normalizedType,
      CacheControl: "public, max-age=31536000, immutable",
      ...(useAcl ? { ACL: "public-read" as const } : {}),
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 120 });
    const publicUrl = `${storage.publicBaseUrl.replace(/\/+$/, "")}/${key}`;

    const uploadHeaders: Record<string, string> = {
      "Content-Type": normalizedType,
    };
    if (useAcl) {
      uploadHeaders["x-amz-acl"] = "public-read";
    }

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      method: "PUT",
      headers: uploadHeaders,
    });
  } catch (error) {
    console.error("Sign upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to prepare upload: ${message}` },
      { status: 500 }
    );
  }
}
