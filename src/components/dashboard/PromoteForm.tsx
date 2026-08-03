"use client";

import { useState } from "react";
import Image from "next/image";
import { Megaphone, Building2, Home, Check, Crown, MapPin } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { PROMOTION_PRICES, MAX_HIGHLIGHT_VILLAS } from "@/lib/constants";
import type { PromotionLevel, PromotionTier, PromotionType } from "@prisma/client";

type VillaOption = {
  id: string;
  title: string;
  cityName: string;
  imageUrl: string | null;
  promotedUntil: string | null;
};

type PromoteFormProps = {
  villas: VillaOption[];
  isRealtor: boolean;
};

const TIERS: PromotionTier[] = ["DAILY", "WEEKLY", "MONTHLY"];

export function PromoteForm({ villas, isRealtor }: PromoteFormProps) {
  const t = useTranslations();

  const [promoType, setPromoType] = useState<PromotionType>("VILLA");
  const [level, setLevel] = useState<PromotionLevel>("STANDARD");
  const [tier, setTier] = useState<PromotionTier>("WEEKLY");
  const [selectedVillaId, setSelectedVillaId] = useState(villas[0]?.id ?? "");
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleHighlight(id: string) {
    setHighlightIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_HIGHLIGHT_VILLAS) return prev;
      return [...prev, id];
    });
  }

  function priceFor(type: PromotionType, tierKey: PromotionTier, lvl: PromotionLevel) {
    const typeKey = type === "VILLA" ? "VILLA" : "PROFILE";
    const levelKey = lvl === "VIP" ? "VIP" : "STANDARD";
    return PROMOTION_PRICES[typeKey][levelKey][tierKey];
  }

  async function handlePay() {
    setLoading(true);
    setError("");

    try {
      const effectiveLevel = promoType === "PROFILE" ? "VIP" : level;
      const body: Record<string, unknown> = {
        type: promoType,
        tier,
        level: effectiveLevel,
      };

      if (promoType === "VILLA") {
        if (!selectedVillaId) {
          setError(t("promotion.selectVilla"));
          setLoading(false);
          return;
        }
        body.villaId = selectedVillaId;
      } else {
        if (highlightIds.length === 0) {
          setError(t("promotion.selectHighlight"));
          setLoading(false);
          return;
        }
        body.highlightedVillaIds = highlightIds;
      }

      const res = await fetch("/api/promotions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("common.errorGeneric"));
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      setError(t("common.errorGeneric"));
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  const effectiveLevel = promoType === "PROFILE" ? "VIP" : level;
  const currentPrice = priceFor(promoType, tier, effectiveLevel);
  const selectedVilla = villas.find((v) => v.id === selectedVillaId);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{t("promotion.chooseType")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPromoType("VILLA")}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
              promoType === "VILLA"
                ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Home className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">{t("promotion.typeVilla")}</p>
              <p className="mt-1 text-sm text-gray-500">{t("promotion.typeVillaHint")}</p>
            </div>
          </button>

          {isRealtor && (
            <button
              type="button"
              onClick={() => setPromoType("PROFILE")}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                promoType === "PROFILE"
                  ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">{t("promotion.typeProfile")}</p>
                <p className="mt-1 text-sm text-gray-500">{t("promotion.typeProfileHint")}</p>
              </div>
            </button>
          )}
        </div>
      </section>

      {promoType === "VILLA" && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("promotion.chooseLevel")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setLevel("STANDARD")}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                level === "STANDARD"
                  ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">{t("promotion.levelStandard")}</p>
                <p className="mt-1 text-sm text-gray-500">{t("promotion.levelStandardHint")}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setLevel("VIP")}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                level === "VIP"
                  ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-gray-900">{t("promotion.levelVip")}</p>
                <p className="mt-1 text-sm text-gray-500">{t("promotion.levelVipHint")}</p>
              </div>
            </button>
          </div>
          {selectedVilla && level === "STANDARD" && (
            <p className="mt-3 text-xs text-gray-500">
              {t("promotion.standardCityNote", { city: selectedVilla.cityName })}
            </p>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          {promoType === "VILLA" ? t("promotion.selectVillaTitle") : t("promotion.selectHighlightTitle")}
        </h2>

        {villas.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">{t("promotion.noVillas")}</p>
        ) : promoType === "VILLA" ? (
          <div className="mt-4 space-y-2">
            {villas.map((villa) => (
              <label
                key={villa.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  selectedVillaId === villa.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="villa"
                  className="sr-only"
                  checked={selectedVillaId === villa.id}
                  onChange={() => setSelectedVillaId(villa.id)}
                />
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {villa.imageUrl ? (
                    <Image src={villa.imageUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <Home className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{villa.title}</p>
                  <p className="text-xs text-gray-500">{villa.cityName}</p>
                </div>
                {villa.promotedUntil && new Date(villa.promotedUntil) > new Date() && (
                  <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    {t("promotion.active")}
                  </span>
                )}
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              {t("promotion.highlightLimit", { max: String(MAX_HIGHLIGHT_VILLAS) })}
            </p>
            {villas.map((villa) => {
              const selected = highlightIds.includes(villa.id);
              return (
                <button
                  key={villa.id}
                  type="button"
                  onClick={() => toggleHighlight(villa.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {villa.imageUrl ? (
                      <Image src={villa.imageUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <Home className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{villa.title}</p>
                    <p className="text-xs text-gray-500">{villa.cityName}</p>
                  </div>
                  {selected && <Check className="h-5 w-5 shrink-0 text-purple-600" />}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{t("promotion.chooseDuration")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TIERS.map((tierKey) => (
            <button
              key={tierKey}
              type="button"
              onClick={() => setTier(tierKey)}
              className={`rounded-xl border p-4 text-center transition ${
                tier === tierKey
                  ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-medium text-gray-900">{t(`promotion.tier.${tierKey}`)}</p>
              <p className="mt-2 text-2xl font-semibold text-purple-700">
                {priceFor(promoType, tierKey, effectiveLevel)} ₼
              </p>
            </button>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading || villas.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60 sm:w-auto"
      >
        <Megaphone className="h-4 w-4" />
        {loading
          ? t("promotion.processing")
          : t("promotion.payNow", { amount: String(currentPrice) })}
      </button>
    </div>
  );
}
