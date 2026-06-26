import type { BookingSlot, CalendarStatus } from "@/types/models";

/** Calendar slot status mirrors the Prisma `CalendarStatus` enum. */
export type SlotStatus = CalendarStatus;

export interface BookingInfo {
  customer: string;
  space: string;
  slot: BookingSlot;
  amount?: number;
}

export interface CalendarEvent {
  id: string;
  /** Local date key, format: yyyy-mm-dd */
  date: string;
  slot: BookingSlot;
  status: CalendarStatus;
  title: string;
  space?: string;
  note?: string;
  booking?: BookingInfo;
}

export const STATUS_META: Record<
  CalendarStatus,
  { label: string; dot: string; soft: string; text: string }
> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-success",
    soft: "bg-success/15",
    text: "text-success",
  },
  BOOKED: {
    label: "Booked",
    dot: "bg-primary",
    soft: "bg-primary/15",
    text: "text-primary",
  },
  BLOCKED: {
    label: "Blocked",
    dot: "bg-warning",
    soft: "bg-warning/15",
    text: "text-warning-foreground dark:text-warning",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-destructive",
    soft: "bg-destructive/15",
    text: "text-destructive",
  },
};

export const STATUS_ORDER: CalendarStatus[] = [
  "AVAILABLE",
  "BOOKED",
  "BLOCKED",
  "MAINTENANCE",
];

/** Priority used to pick a single dominant status for a day cell. */
export const STATUS_PRIORITY: CalendarStatus[] = [
  "BOOKED",
  "MAINTENANCE",
  "BLOCKED",
  "AVAILABLE",
];
