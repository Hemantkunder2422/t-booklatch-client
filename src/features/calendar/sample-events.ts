import type { CalendarEvent } from "./types";
import { addMonths, dateKey } from "./utils";

export const SAMPLE_SPACES = [
  "Grand Atrium Hall",
  "Riverside Pavilion",
  "The Glasshouse Loft",
  "Skyline Rooftop",
];

/**
 * Non-booking "ambiance" entries (maintenance windows, tentative holds) so the
 * calendar has texture beyond live bookings. Real bookings come from the store
 * (see booking-events.ts); these carry no `booking` payload. Anchored to the
 * given month and the next so there's always something near "today".
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
        date: k(14),
        start: "09:00",
        end: "17:00",
        status: "MAINTENANCE",
        title: "Floor refinishing",
        space: "Skyline Rooftop",
        note: "No events — maintenance window.",
      },
      {
        id: id(2),
        date: k(9),
        start: "12:00",
        end: "16:00",
        status: "BLOCKED",
        title: "Tentative hold",
        space: "Riverside Pavilion",
        note: "Awaiting deposit from Northwind Inc.",
      },
      {
        id: id(3),
        date: k(22),
        start: "08:00",
        end: "11:00",
        status: "MAINTENANCE",
        title: "AV rig servicing",
        space: "Grand Atrium Hall",
      },
    ];
  };

  return [...forMonth(base, "m0"), ...forMonth(addMonths(base, 1), "m1")];
}
