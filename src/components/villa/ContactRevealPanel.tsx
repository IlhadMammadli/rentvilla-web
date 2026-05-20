"use client";

import { useState } from "react";
import { Phone, User } from "lucide-react";
import { useTranslations } from "@/i18n/client";

type ContactRevealPanelProps = {
  villaId: string;
  contactName: string;
};

function getVisitorId() {
  const key = "rentvilla_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function ContactRevealPanel({
  villaId,
  contactName,
}: ContactRevealPanelProps) {
  const t = useTranslations();
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function revealContact() {
    if (phone) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/villas/${villaId}/reveal-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("common.errorGeneric"));
        return;
      }
      setPhone(data.contactPhone);
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-6">
      <h2 className="text-lg font-medium text-gray-900">{t("villa.contactHost")}</h2>
      <p className="mt-1 text-sm text-gray-500">{t("villa.contactSubtitle")}</p>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">{t("villa.contactName")}</p>
            <p className="font-medium text-gray-900">{contactName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Phone className="h-5 w-5 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400">{t("villa.contactPhone")}</p>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="font-medium text-gray-900 hover:underline"
              >
                {phone}
              </a>
            ) : (
              <p className="text-sm text-gray-400">{t("villa.contactHidden")}</p>
            )}
          </div>
        </div>
      </div>

      {!phone && (
        <button
          type="button"
          onClick={revealContact}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? t("villa.revealing") : t("villa.showContact")}
        </button>
      )}

      {phone && (
        <a
          href={`tel:${phone}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          <Phone className="h-4 w-4" />
          {t("villa.callToRent")}
        </a>
      )}

      <p className="mt-3 text-center text-xs text-gray-400">{t("villa.showContactHint")}</p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
    </aside>
  );
}
