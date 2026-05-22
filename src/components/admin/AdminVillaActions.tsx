"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/i18n/client";

type AdminVillaActionsProps = {
  villaId: string;
  isPublished: boolean;
  isPromoted: boolean;
  isAdmin: boolean;
};

export function AdminVillaActions({
  villaId,
  isPublished,
  isPromoted,
  isAdmin: actorIsAdmin,
}: AdminVillaActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/admin/villas/${villaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? t("common.errorGeneric"));
  }

  async function removeVilla() {
    if (!confirm(t("admin.confirmDeleteVilla"))) return;
    setLoading(true);
    const res = await fetch(`/api/admin/villas/${villaId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? t("common.errorGeneric"));
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        disabled={loading}
        onClick={() => patch({ isPublished: !isPublished })}
        className={`rounded-lg px-2 py-1 text-xs font-medium ${
          isPublished
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isPublished ? t("admin.disablePost") : t("admin.enablePost")}
      </button>
      {actorIsAdmin && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => patch({ isPromoted: !isPromoted })}
            className={`rounded-lg px-2 py-1 text-xs font-medium ${
              isPromoted
                ? "bg-purple-100 text-purple-800"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            {isPromoted ? t("admin.unpromote") : t("admin.promote")}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={removeVilla}
            className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            {t("admin.delete")}
          </button>
        </>
      )}
    </div>
  );
}
