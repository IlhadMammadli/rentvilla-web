export const MAX_GALLERY_IMAGES = 12;

export const SITE_NAME = "VillaHub";
export const SITE_LOGO_PATH = "/villahub-logo.png";

export const MAX_HIGHLIGHT_VILLAS = 3;

/** Promotion prices in AZN — editable via env or here */
export const PROMOTION_PRICES = {
  VILLA: {
    DAILY: Number(process.env.PROMO_VILLA_DAILY ?? 5),
    WEEKLY: Number(process.env.PROMO_VILLA_WEEKLY ?? 25),
    MONTHLY: Number(process.env.PROMO_VILLA_MONTHLY ?? 80),
  },
  PROFILE: {
    DAILY: Number(process.env.PROMO_PROFILE_DAILY ?? 10),
    WEEKLY: Number(process.env.PROMO_PROFILE_WEEKLY ?? 50),
    MONTHLY: Number(process.env.PROMO_PROFILE_MONTHLY ?? 150),
  },
} as const;

export const PROMOTION_TIER_DAYS = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
} as const;
