"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/i18n/client";
import type { UserRole } from "@prisma/client";

type AdminUserActionsProps = {
  userId: string;
  role: UserRole;
  isBlocked: boolean;
  isAdmin: boolean;
};

export function AdminUserActions({
  userId,
  role,
  isBlocked,
  isAdmin: actorIsAdmin,
}: AdminUserActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? t("common.errorGeneric"));
  }

  async function removeUser() {
    if (!confirm(t("admin.confirmDeleteUser"))) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert((await res.json()).error ?? t("common.errorGeneric"));
  }

  if (role === "ADMIN") {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {actorIsAdmin && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => patch({ isBlocked: !isBlocked })}
            className={`rounded-lg px-2 py-1 text-xs font-medium ${
              isBlocked
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            {isBlocked ? t("admin.unblock") : t("admin.block")}
          </button>
          {role !== "SITE_MANAGER" ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => patch({ role: "SITE_MANAGER" })}
              className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              {t("admin.makeManager")}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => patch({ role: "VILLA_OWNER" })}
              className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              {t("admin.revokeManager")}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={removeUser}
            className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            {t("admin.delete")}
          </button>
        </>
      )}
    </div>
  );
}
