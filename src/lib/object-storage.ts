function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

/**
 * S3 API endpoint must be region-only, e.g. https://fra1.digitaloceanspaces.com
 * NOT the bucket URL (https://bucket.fra1.digitaloceanspaces.com) — that doubles the bucket in signed URLs.
 */
export function normalizeS3ApiEndpoint(
  endpoint: string,
  bucket: string,
  region: string
): string {
  const trimmed = endpoint.replace(/\/+$/, "");
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname;

    // bucket.region.digitaloceanspaces.com → region.digitaloceanspaces.com
    const bucketPrefix = `${bucket}.`;
    if (host.startsWith(bucketPrefix) && host.endsWith(".digitaloceanspaces.com")) {
      return `https://${region}.digitaloceanspaces.com`;
    }

    // CDN URL used by mistake as S3_ENDPOINT
    if (host.includes("cdn.digitaloceanspaces.com")) {
      return `https://${region}.digitaloceanspaces.com`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function getObjectStorageConfig() {
  const bucket = cleanEnv(process.env.S3_BUCKET);
  const region = cleanEnv(process.env.S3_REGION) || "fra1";
  const rawEndpoint = cleanEnv(process.env.S3_ENDPOINT);
  const endpoint = normalizeS3ApiEndpoint(rawEndpoint, bucket, region);
  const accessKeyId = cleanEnv(process.env.S3_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnv(process.env.S3_SECRET_ACCESS_KEY);
  const publicBaseUrl = cleanEnv(process.env.S3_PUBLIC_BASE_URL);

  return {
    bucket,
    region,
    endpoint,
    rawEndpoint,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    isConfigured:
      Boolean(bucket) &&
      Boolean(endpoint) &&
      Boolean(accessKeyId) &&
      Boolean(secretAccessKey) &&
      Boolean(publicBaseUrl),
  };
}

export function getPublicStorageHost(): string | null {
  const { publicBaseUrl } = getObjectStorageConfig();
  if (!publicBaseUrl) return null;
  try {
    return new URL(publicBaseUrl).hostname;
  } catch {
    return null;
  }
}

export function canUseSignedObjectStorageUpload(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    cleanEnv(process.env.NEXT_PUBLIC_S3_UPLOAD_MODE) === "signed" &&
      cleanEnv(process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL)
  );
}
