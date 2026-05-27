function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function getObjectStorageConfig() {
  const bucket = cleanEnv(process.env.S3_BUCKET);
  const region = cleanEnv(process.env.S3_REGION) || "auto";
  const endpoint = cleanEnv(process.env.S3_ENDPOINT);
  const accessKeyId = cleanEnv(process.env.S3_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnv(process.env.S3_SECRET_ACCESS_KEY);
  const publicBaseUrl = cleanEnv(process.env.S3_PUBLIC_BASE_URL);

  return {
    bucket,
    region,
    endpoint,
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

