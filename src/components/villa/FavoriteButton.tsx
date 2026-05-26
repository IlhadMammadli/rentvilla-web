"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useTranslations } from "@/i18n/client";

type FavoriteButtonProps = {
  villaId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function FavoriteButton({
  villaId,
  initialFavorited,
  isLoggedIn,
  size = "md",
  className = "",
}: FavoriteButtonProps) {
  const t = useTranslations();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const pad = size === "sm" ? "p-1.5" : "p-2";

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(
        `/register?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      );
      return;
    }

    setLoading(true);
    const method = favorited ? "DELETE" : "POST";
    const res = await fetch(`/api/villas/${villaId}/favorite`, { method });
    setLoading(false);

    if (res.ok) {
      setFavorited(!favorited);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? t("common.errorGeneric"));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? t("favorites.remove") : t("favorites.add")}
      title={favorited ? t("favorites.remove") : t("favorites.add")}
      className={`rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-60 ${pad} ${className}`}
    >
      <Heart
        className={`${iconSize} transition ${
          favorited ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
        }`}
      />
    </button>
  );
}
