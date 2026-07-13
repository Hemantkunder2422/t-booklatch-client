import type { Booking } from "@/features/bookings/store";
import type { CalendarEvent } from "./types";

/**
 * Project live bookings onto the calendar as continuous time blocks so
 * availability always reflects the real book of business. Confirmed/completed
 * bookings occupy their window; pending ones show as holds. Cancelled bookings
 * are omitted — which is how cancelling frees the slot on the calendar.
 */
export function bookingsToEvents(bookings: Booking[]): CalendarEvent[] {
  return bookings
    .filter((b) => b.bookingStatus !== "CANCELLED")
    .map((b) => {
      const hold = b.bookingStatus === "PENDING";
      return {
        id: `booking-${b.id}`,
        date: b.bookingDate,
        start: b.startTime,
        end: b.endTime,
        status: hold ? "BLOCKED" : "BOOKED",
        title: hold ? `Hold — ${b.eventName}` : b.eventName,
        space: b.venueSpaceName,
        note: hold ? "Awaiting payment to confirm." : b.notes,
        booking: {
          customer: b.customerName,
          space: b.venueSpaceName,
          start: b.startTime,
          end: b.endTime,
          amount: b.amount,
        },
      } satisfies CalendarEvent;
    });
}
