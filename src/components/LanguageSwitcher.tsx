"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-2.5 pr-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow"
      >
        <span className="text-lg leading-none" aria-hidden>
          {localeFlags[locale]}
        </span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("nav.language")}
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          {locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                  loc === locale ? "bg-gray-50 font-medium text-gray-900" : "text-gray-700"
                }`}
              >
                <span className="text-xl leading-none">{localeFlags[loc]}</span>
                <span className="flex-1">{localeNames[loc]}</span>
                {loc === locale && <Check className="h-4 w-4 text-gray-900" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
