"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/i18n/client";

type VillaImageCarouselProps = {
  images: string[];
  alt: string;
};

export function VillaImageCarousel({ images, alt }: VillaImageCarouselProps) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const total = images.length;

  function goPrev() {
    setIndex((i) => (i === 0 ? total - 1 : i - 1));
  }

  function goNext() {
    setIndex((i) => (i === total - 1 ? 0 : i + 1));
  }

  if (total === 0) return null;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/9] bg-gray-100">
        <Image
          src={images[index]}
          alt={`${alt} — ${index + 1}`}
          fill
          className="object-cover"
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("villa.carouselPrev")}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t("villa.carouselNext")}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1} / ${total}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {index + 1} / {total}
          </span>
        </>
      )}
    </div>
  );
}
