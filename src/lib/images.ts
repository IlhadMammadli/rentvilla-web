export const DEFAULT_VILLA_IMAGE =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80";

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
    return sorted.map((i) => i.url);
  }

  if (villa.imageUrl) return [villa.imageUrl];
  return [DEFAULT_VILLA_IMAGE];
}

export function getMainImageUrl(villa: VillaWithImages): string {
  return getVillaImageUrls(villa)[0];
}

export function getGalleryImageUrls(villa: VillaWithImages): string[] {
  return getVillaImageUrls(villa);
}
