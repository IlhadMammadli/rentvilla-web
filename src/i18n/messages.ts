import type { Locale } from "./config";
import az from "./locales/az.json";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

export type Messages = typeof en;

const messages: Record<Locale, Messages> = { az, en, ru };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.az;
}
