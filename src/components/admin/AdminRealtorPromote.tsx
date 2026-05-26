"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/i18n/client";

export function AdminRealtorPromote({
  userId,
  isPromoted,
}: {
  userId: string;
  isPromoted: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoteCompany: !isPromoted }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? t("common.errorGeneric"));
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className={`rounded-lg px-2 py-1 text-xs font-medium ${
        isPromoted
          ? "bg-purple-100 text-purple-800"
          : "bg-purple-50 text-purple-700 hover:bg-purple-100"
      }`}
    >
      {isPromoted ? t("admin.unpromoteCompany") : t("admin.promoteCompany")}
    </button>
  );
}
