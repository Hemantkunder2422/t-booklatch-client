import type { CalendarEvent } from "./types";
import { addMonths, dateKey } from "./utils";

export const SAMPLE_SPACES = [
  "Grand Atrium Hall",
  "Riverside Pavilion",
  "The Glasshouse Loft",
  "Skyline Rooftop",
];

/**
 * Build a realistic spread of calendar entries for the given month and the
 * next, so the calendar always shows data near "today". Status values mirror
 * the Prisma `CalendarStatus` enum.
 */
export function buildSampleEvents(base: Date): CalendarEvent[] {
  const forMonth = (monthDate: Date, salt: string): CalendarEvent[] => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();
    const k = (day: number) => dateKey(new Date(y, m, day));
    const id = (n: number) => `${salt}-${n}`;

    return [
      {
        id: id(1),
        date: k(3),
        slot: "EVENING",
        status: "BOOKED",
        title: "Wedding — Olivia B.",
        space: "Grand Atrium Hall",
        note: "Plated dinner for 180. AV team arrives 2pm.",
        booking: {
          customer: "Olivia Bennett",
          space: "Grand Atrium Hall",
          slot: "EVENING",
          amount: 4200,
        },
      },
      {
        id: id(2),
        date: k(3),
        slot: "MORNING",
        status: "BLOCKED",
        title: "Hold — Corporate offsite",
        space: "Riverside Pavilion",
        note: "Awaiting deposit from Northwind Inc.",
      },
      {
        id: id(3),
        date: k(8),
        slot: "FULL_DAY",
        status: "BOOKED",
        title: "Conference — Northwind",
        space: "Riverside Pavilion",
        booking: {
          customer: "Marcus Reid",
          space: "Riverside Pavilion",
          slot: "FULL_DAY",
          amount: 1900,
        },
      },
      {
        id: id(4),
        date: k(12),
        slot: "FULL_DAY",
        status: "AVAILABLE",
        title: "Open for bookings",
        space: "The Glasshouse Loft",
      },
      {
        id: id(5),
        date: k(14),
        slot: "FULL_DAY",
        status: "MAINTENANCE",
        title: "Floor refinishing",
        space: "Skyline Rooftop",
        note: "No events — maintenance window.",
      },
      {
        id: id(6),
        date: k(17),
        slot: "EVENING",
        status: "BLOCKED",
        title: "Hold — Birthday party",
        space: "The Glasshouse Loft",
        note: "Tentative, confirming headcount.",
      },
      {
        id: id(7),
        date: k(20),
        slot: "EVENING",
        status: "BOOKED",
        title: "Gala — Aurora Foundation",
        space: "The Glasshouse Loft",
        note: "Black-tie. Valet required.",
        booking: {
          customer: "Priya Nair",
          space: "The Glasshouse Loft",
          slot: "EVENING",
          amount: 2600,
        },
      },
      {
        id: id(8),
        date: k(20),
        slot: "MORNING",
        status: "AVAILABLE",
        title: "Rooftop open",
        space: "Skyline Rooftop",
      },
      {
        id: id(9),
        date: k(24),
        slot: "EVENING",
        status: "BOOKED",
        title: "Product launch",
        space: "Skyline Rooftop",
        booking: {
          customer: "Daniel Cho",
          space: "Skyline Rooftop",
          slot: "EVENING",
          amount: 3100,
        },
      },
      {
        id: id(10),
        date: k(27),
        slot: "MORNING",
        status: "BLOCKED",
        title: "Hold — Workshop",
        space: "Grand Atrium Hall",
      },
    ];
  };

  return [...forMonth(base, "m0"), ...forMonth(addMonths(base, 1), "m1")];
}
