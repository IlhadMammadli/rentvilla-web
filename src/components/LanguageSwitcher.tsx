"use client";

import { locales, localeNames, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="language-select">
        {t("nav.language")}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-7 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-900"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
