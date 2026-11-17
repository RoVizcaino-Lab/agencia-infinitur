import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Trip dates come as "YYYY-MM-DD". `new Date("2026-12-16")` parses that as UTC
// midnight, which in Mexico is still the previous day — so build a local date.
export function parseDate(value) {
  const m = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
}
