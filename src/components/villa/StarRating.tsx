"use client";

import { Star } from "lucide-react";

type StarRatingProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
};

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const iconClass = sizes[size];

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={
              interactive
                ? "rounded p-0.5 transition hover:scale-110 disabled:cursor-default"
                : "pointer-events-none"
            }
            aria-label={interactive ? `${star} stars` : undefined}
          >
            <Star
              className={`${iconClass} ${
                filled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
              }`}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
