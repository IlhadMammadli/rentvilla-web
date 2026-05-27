import { requiresCloudStorage } from "./upload";

const ALLOWED_IMAGE_HOSTS = new Set(["res.cloudinary.com", "images.unsplash.com"]);

export function isAllowedImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/uploads/")) {
    return !requiresCloudStorage();
  }

  try {
    const { hostname, protocol } = new URL(trimmed);
    return protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export function mapVillaCreateError(error: unknown): { message: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error);

  if (raw.includes("CLOUDINARY_NOT_CONFIGURED") || raw.includes("Cannot save images")) {
    return {
      status: 503,
      message:
        "Photo upload is not configured on the server. Add Cloudinary environment variables in Netlify (see docs/NETLIFY.md).",
    };
  }

  if (raw.includes("Cloudinary upload failed")) {
    return {
      status: 502,
      message: "Photo upload failed. Check Cloudinary upload preset (must be unsigned) and try smaller images.",
    };
  }

  if (raw.includes("Invalid image URL")) {
    return { status: 400, message: raw };
  }

  if (raw.includes("Payload Too Large") || raw.includes("413")) {
    return {
      status: 413,
      message:
        "Photos are too large for the server. Use smaller images or configure Cloudinary (NEXT_PUBLIC_CLOUDINARY_*).",
    };
  }

  if (raw.includes("Unique constraint") || raw.includes("P2002")) {
    return { status: 409, message: "This villa could not be saved due to a duplicate value." };
  }

  if (raw.includes("Foreign key") || raw.includes("P2003")) {
    return { status: 400, message: "Invalid city, district, or facility selected." };
  }

  return { status: 500, message: "Failed to create villa. Please try again." };
}

export type VillaCreateFields = {
  title: string;
  cityId: string;
  districtId: string | null;
  price: number;
  pricePeriod: "DAILY" | "MONTHLY";
  guestCount: number;
  roomCount: number;
  contactName: string;
  contactPhone: string;
  description: string;
  address: string;
  isAFrame: boolean;
  facilityIds: string[];
};
