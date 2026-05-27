export const DEFAULT_VILLA_IMAGE =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80";

/** Local `/uploads/...` paths only exist on the machine that saved the file. */
export function canServeLocalUploadPaths(): boolean {
  if (process.env.USE_LOCAL_UPLOADS === "true") return true;
  if (process.env.NETLIFY === "true" || process.env.VERCEL === "1") return false;
  return true;
}

export function resolveImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return DEFAULT_VILLA_IMAGE;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/") && !canServeLocalUploadPaths()) {
    return DEFAULT_VILLA_IMAGE;
  }
  return trimmed;
}

export type VillaImageRecord = {
  url: string;
  isMain: boolean;
  sortOrder: number;
};

export type VillaWithImages = {
  imageUrl: string | null;
  images?: VillaImageRecord[];
};

export function getVillaImageUrls(villa: VillaWithImages): string[] {
  const sorted = [...(villa.images ?? [])].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  if (sorted.length > 0) {
    return sorted.map((i) => resolveImageUrl(i.url));
  }

  if (villa.imageUrl) return [resolveImageUrl(villa.imageUrl)];
  return [DEFAULT_VILLA_IMAGE];
}

export function getMainImageUrl(villa: VillaWithImages): string {
  return getVillaImageUrls(villa)[0];
}

export function getGalleryImageUrls(villa: VillaWithImages): string[] {
  return getVillaImageUrls(villa);
}
