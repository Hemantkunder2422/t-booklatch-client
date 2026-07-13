export interface CalendarCell {
  date: Date;
  key: string;
  inCurrentMonth: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Local date key (yyyy-mm-dd) without timezone surprises. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function monthLabel(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Monday-anchored start of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const dow = date.getDay(); // 0 Sun … 6 Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(date, diff);
}

/** Minutes since midnight for an "HH:mm" string. */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** "18:00" → "6 PM", "23:30" → "11:30 PM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${period}` : `${hour} ${period}`;
}

export function timeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Label for a span of day columns, e.g. "Jul 6 – 12, 2026" or a single day. */
export function rangeLabel(days: Date[]): string {
  if (days.length === 0) return "";
  const first = days[0];
  const last = days[days.length - 1];
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (days.length === 1) {
    return first.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  const sameMonth = first.getMonth() === last.getMonth();
  const left = first.toLocaleDateString("en-US", opts);
  const right = sameMonth
    ? last.getDate()
    : last.toLocaleDateString("en-US", opts);
  return `${left} – ${right}, ${last.getFullYear()}`;
}

/**
 * Build a 6-row month grid (always 42 cells) including leading/trailing
 * days from the adjacent months so the calendar stays a stable size.
 */
export function getMonthMatrix(viewDate: Date): CalendarCell[][] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startWeekday);

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 6; w++) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cursor),
        key: dateKey(cursor),
        inCurrentMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}
