import Image from "next/image";
import Link from "next/link";
import { SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";

type BrandLogoProps = {
  href?: string;
  /** Header: compact square mark. Full: wider mark with wordmark visible. */
  variant?: "header" | "full";
  className?: string;
};

const variantSizes = {
  header: { width: 40, height: 40, className: "h-9 w-9 rounded-lg sm:h-10 sm:w-10" },
  full: { width: 160, height: 160, className: "h-24 w-24 sm:h-28 sm:w-28" },
} as const;

export function BrandLogo({ href = "/", variant = "header", className = "" }: BrandLogoProps) {
  const size = variantSizes[variant];
  const image = (
    <Image
      src={SITE_LOGO_PATH}
      alt={SITE_NAME}
      width={size.width}
      height={size.height}
      className={`object-contain ${size.className} ${className}`}
      priority={variant === "header"}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center" aria-label={SITE_NAME}>
        {image}
      </Link>
    );
  }

  return image;
}
