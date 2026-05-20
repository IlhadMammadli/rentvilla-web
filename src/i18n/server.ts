import { cookies } from "next/headers";
import {
  defaultLocale,
  isValidLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./config";
import { getMessages, type Messages } from "./messages";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isValidLocale(value)) return value;
  return defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  const messages = getMessages(locale);

  function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split(".");
    let value: unknown = messages;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") return key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      value
    );
  }

  return { t, locale, messages };
}

export type TranslationFn = ReturnType<typeof getTranslations> extends Promise<infer R>
  ? R extends { t: infer T }
    ? T
    : never
  : never;

export { type Messages };
