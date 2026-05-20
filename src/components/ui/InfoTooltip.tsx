"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

type InfoTooltipProps = {
  text: string;
  className?: string;
};

export function InfoTooltip({ text, className = "" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open && (
        <div
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-gray-100 bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-lg sm:left-full sm:top-1/2 sm:mt-0 sm:ml-2 sm:w-72 sm:translate-x-0 sm:-translate-y-1/2"
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-gray-100 bg-white sm:-left-1.5 sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2 sm:border-l sm:border-b sm:border-t-0" />
          {text}
        </div>
      )}
    </div>
  );
}
