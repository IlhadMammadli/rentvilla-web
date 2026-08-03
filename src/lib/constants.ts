export const MAX_GALLERY_IMAGES = 12;

export const SITE_NAME = "VillaHub";
export const SITE_LOGO_PATH = "/villahub-logo.png";

export const MAX_HIGHLIGHT_VILLAS = 3;

/**
 * Promotion prices in AZN.
 * STANDARD = city search segment only.
 * VIP = always on the home page (higher price).
 */
export const PROMOTION_PRICES = {
  VILLA: {
    STANDARD: {
      DAILY: Number(process.env.PROMO_VILLA_DAILY ?? 5),
      WEEKLY: Number(process.env.PROMO_VILLA_WEEKLY ?? 25),
      MONTHLY: Number(process.env.PROMO_VILLA_MONTHLY ?? 80),
    },
    VIP: {
      DAILY: Number(process.env.PROMO_VIP_VILLA_DAILY ?? 15),
      WEEKLY: Number(process.env.PROMO_VIP_VILLA_WEEKLY ?? 70),
      MONTHLY: Number(process.env.PROMO_VIP_VILLA_MONTHLY ?? 200),
    },
  },
  PROFILE: {
    STANDARD: {
      DAILY: Number(process.env.PROMO_PROFILE_DAILY ?? 10),
      WEEKLY: Number(process.env.PROMO_PROFILE_WEEKLY ?? 50),
      MONTHLY: Number(process.env.PROMO_PROFILE_MONTHLY ?? 150),
    },
    VIP: {
      DAILY: Number(process.env.PROMO_VIP_PROFILE_DAILY ?? 20),
      WEEKLY: Number(process.env.PROMO_VIP_PROFILE_WEEKLY ?? 90),
      MONTHLY: Number(process.env.PROMO_VIP_PROFILE_MONTHLY ?? 250),
    },
  },
} as const;

export const PROMOTION_TIER_DAYS = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
} as const;
