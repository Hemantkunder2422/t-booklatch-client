import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicts.
 * Use across the app instead of manual template strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a localized currency string. */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a date into a readable label, e.g. "Jun 23, 2026". */
export function formatDate(
  date: Date | string | number,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/** Build initials from a name, e.g. "Grand Ballroom" -> "GB". */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Promise-based delay helper, handy for optimistic UI and tests. */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
