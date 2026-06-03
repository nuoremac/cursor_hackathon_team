import type { Locale } from "./types";

const LOCALE_TAG: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
};

/**
 * Format a number using locale-aware grouping and append the FCFA suffix.
 * FR -> "1 500 000 FCFA", EN -> "1,500,000 FCFA".
 */
export function formatCurrency(value: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(value)} FCFA`;
}

/** Plain locale-aware integer (no currency suffix). */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact amount for chart axes: 1.2M, 500K, etc. */
export function formatCompact(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format an ISO date string ("YYYY-MM-DD").
 * FR -> DD/MM/YYYY, EN -> MM/DD/YYYY.
 */
export function formatDate(iso: string, locale: Locale): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Parse an ISO date safely as UTC midnight (avoids timezone drift). */
export function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

/** Returns true if the ISO date falls on Saturday or Sunday (UTC). */
export function isWeekend(iso: string): boolean {
  const date = parseIsoDate(iso);
  if (!date) return false;
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}
