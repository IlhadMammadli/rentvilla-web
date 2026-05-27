const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function normalizeImageContentType(file: File): string {
  const type = file.type?.toLowerCase() ?? "";
  if (ALLOWED_IMAGE_TYPES.has(type)) {
    return type === "image/jpg" ? "image/jpeg" : type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/jpeg";
  return "image/jpeg";
}

export function isAllowedImageContentType(contentType: string): boolean {
  const normalized = contentType === "image/jpg" ? "image/jpeg" : contentType;
  return ALLOWED_IMAGE_TYPES.has(normalized) || normalized === "image/jpeg";
}

export function extensionFromContentType(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}
