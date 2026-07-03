import type { BookingSlot } from "@/types/models";
import { dateKey } from "./utils";

export const PRICE_SLOTS: BookingSlot[] = ["MORNING", "EVENING", "FULL_DAY"];

export interface PricingState {
  /** Fallback price per slot when a day has no override. */
  base: Record<BookingSlot, number>;
  /** Per-day overrides: dateKey → { slot: price }. */
  overrides: Record<string, Partial<Record<BookingSlot, number>>>;
}

export const DEFAULT_PRICING: PricingState = {
  base: { MORNING: 25000, EVENING: 42000, FULL_DAY: 60000 },
  overrides: {},
};

/** Effective price for a slot on a day (override → base). */
export function priceFor(
  p: PricingState,
  key: string,
  slot: BookingSlot,
): number {
  return p.overrides[key]?.[slot] ?? p.base[slot];
}

/** Cheapest slot price for a day — used for the "from ₹…" cell label. */
export function fromPrice(p: PricingState, key: string): number {
  return Math.min(...PRICE_SLOTS.map((s) => priceFor(p, key, s)));
}

export function hasOverride(p: PricingState, key: string): boolean {
  return Boolean(p.overrides[key]);
}

/** Apply a price to a slot (or all slots) across a set of days. */
export function applyPrice(
  p: PricingState,
  keys: string[],
  slot: BookingSlot | "ALL",
  price: number,
): PricingState {
  const overrides = { ...p.overrides };
  for (const key of keys) {
    const current = { ...(overrides[key] ?? {}) };
    if (slot === "ALL") {
      current.MORNING = price;
      current.EVENING = price;
      current.FULL_DAY = price;
    } else {
      current[slot] = price;
    }
    overrides[key] = current;
  }
  return { ...p, overrides };
}

/** Set every slot for a single day (day-wise pricing). */
export function setDayPrices(
  p: PricingState,
  key: string,
  prices: Record<BookingSlot, number>,
): PricingState {
  return { ...p, overrides: { ...p.overrides, [key]: { ...prices } } };
}

/** Remove a day's override so it falls back to base pricing. */
export function clearDay(p: PricingState, key: string): PricingState {
  const overrides = { ...p.overrides };
  delete overrides[key];
  return { ...p, overrides };
}

/** Inclusive list of date keys between two dates. */
export function rangeKeys(from: Date, to: Date): string[] {
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const keys: string[] = [];
  while (cursor <= last) {
    keys.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

/** All date keys within a calendar month. */
export function monthKeys(year: number, month: number): string[] {
  const cursor = new Date(year, month, 1);
  const keys: string[] = [];
  while (cursor.getMonth() === month) {
    keys.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

/** Parse an <input type="date"> value into a local Date. */
export function parseInputDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Parse an <input type="month"> value (yyyy-mm). */
export function parseInputMonth(value: string): { year: number; month: number } | null {
  if (!value) return null;
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m - 1 };
}
