import type { NextConfig } from "next";

function getStorageHostname() {
  const raw = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL || process.env.S3_PUBLIC_BASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const storageHostname = getStorageHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(storageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: storageHostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
