"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/i18n/client";

export function AFrameFilter() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("aframe") === "1";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (active) params.delete("aframe");
    else params.set("aframe", "1");
    const q = params.toString();
    router.push(q ? `/?${q}` : "/");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-amber-600 bg-amber-50 text-amber-900"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {t("home.aframeFilter")}
    </button>
  );
}
