"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/villa/StarRating";
import { useTranslations } from "@/i18n/client";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
};

type VillaReviewsSectionProps = {
  villaId: string;
  ownerUserId: string;
  initialAverage: number;
  initialCount: number;
  isLoggedIn: boolean;
  currentUserId?: string;
};

export function VillaReviewsSection({
  villaId,
  ownerUserId,
  initialAverage,
  initialCount,
  isLoggedIn,
  currentUserId,
}: VillaReviewsSectionProps) {
  const t = useTranslations();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isOwner = currentUserId === ownerUserId;
  const canReview = isLoggedIn && !isOwner;

  useEffect(() => {
    fetch(`/api/villas/${villaId}/reviews`)
      .then((r) => r.json())
      .then((data: { reviews: ReviewItem[] }) => {
        setReviews(data.reviews ?? []);
        if (data.reviews?.length) {
          const c = data.reviews.length;
          const avg = data.reviews.reduce((s, r) => s + r.rating, 0) / c;
          setAverage(Math.round(avg * 10) / 10);
          setCount(c);
        }
      })
      .catch(() => {});
  }, [villaId]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`/api/villas/${villaId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("common.errorGeneric"));
        return;
      }
      setSuccess(true);
      const listRes = await fetch(`/api/villas/${villaId}/reviews`);
      const listData = await listRes.json();
      const list = listData.reviews ?? [];
      setReviews(list);
      const c = list.length;
      setCount(c);
      setAverage(c > 0 ? Math.round((list.reduce((s: number, r: ReviewItem) => s + r.rating, 0) / c) * 10) / 10 : 0);
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 border-t border-gray-100 pt-10">
      <h2 className="text-lg font-medium text-gray-900">{t("villa.reviewsTitle")}</h2>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StarRating value={average} size="lg" />
        <span className="text-sm text-gray-600">
          {count > 0
            ? t("villa.reviewsSummary", { average, count })
            : t("villa.reviewsEmpty")}
        </span>
      </div>

      {canReview && (
        <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
          <p className="text-sm font-medium text-gray-900">{t("villa.reviewFormTitle")}</p>
          <div className="mt-3">
            <span className="mb-2 block text-xs text-gray-500">{t("villa.reviewRatingLabel")}</span>
            <StarRating value={rating} size="lg" interactive onChange={setRating} />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-gray-500">{t("villa.reviewCommentLabel")}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={t("villa.reviewCommentPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm text-green-700">{t("villa.reviewSubmitted")}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? t("villa.reviewSubmitting") : t("villa.reviewSubmit")}
          </button>
        </form>
      )}

      {!isLoggedIn && (
        <p className="mt-4 text-sm text-gray-500">{t("villa.reviewLoginRequired")}</p>
      )}

      {isOwner && (
        <p className="mt-4 text-sm text-gray-500">{t("villa.reviewOwnerCannot")}</p>
      )}

      {reviews.length > 0 && (
        <ul className="mt-8 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">{r.authorName}</span>
                <StarRating value={r.rating} size="sm" />
              </div>
              {r.comment && (
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{r.comment}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
