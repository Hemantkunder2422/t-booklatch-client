import type { Booking } from "@/features/bookings/store";
import type { CalendarEvent } from "./types";

/**
 * Project live bookings onto the calendar so availability always reflects the
 * real book of business. Confirmed/completed bookings occupy the slot; pending
 * ones are shown as holds. Cancelled bookings are omitted entirely — which is
 * how cancelling a booking frees its slot on the calendar.
 */
export function bookingsToEvents(bookings: Booking[]): CalendarEvent[] {
  return bookings
    .filter((b) => b.bookingStatus !== "CANCELLED")
    .map((b) => {
      const hold = b.bookingStatus === "PENDING";
      return {
        id: `booking-${b.id}`,
        date: b.bookingDate,
        slot: b.slot,
        status: hold ? "BLOCKED" : "BOOKED",
        title: hold ? `Hold — ${b.eventName}` : b.eventName,
        space: b.venueSpaceName,
        note: hold ? "Awaiting payment to confirm." : b.notes,
        booking: {
          customer: b.customerName,
          space: b.venueSpaceName,
          slot: b.slot,
          amount: b.amount,
        },
      } satisfies CalendarEvent;
    });
}
