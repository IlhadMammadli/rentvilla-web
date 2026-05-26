/** Human-readable listing ID shown on detail pages and used in admin search. */
export function formatPostNumber(postNumber: number): string {
  return `RV-${String(postNumber).padStart(5, "0")}`;
}

/** Accepts "RV-00042", "00042", or "42". */
export function parsePostNumberQuery(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withoutPrefix = trimmed.replace(/^rv[-\s]?/i, "");
  const digits = withoutPrefix.replace(/\D/g, "");
  if (!digits) return null;

  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
