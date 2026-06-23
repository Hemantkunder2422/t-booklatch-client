import { CalendarView } from "@/features/calendar/calendar-view";

export const metadata = { title: "Calendars" };

export default function CalendarsPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Calendars</h1>
        <p className="text-muted-foreground">
          A unified view of bookings, holds, and availability across your spaces.
        </p>
      </div>
      <CalendarView />
    </>
  );
}
