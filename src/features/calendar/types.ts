export type SlotStatus = "available" | "booked" | "pending" | "blocked";

export interface BookingInfo {
  customer: string;
  space: string;
  time: string;
  amount?: number;
}

export interface CalendarEvent {
  id: string;
  /** Local date key, format: yyyy-mm-dd */
  date: string;
  status: SlotStatus;
  title: string;
  space?: string;
  note?: string;
  booking?: BookingInfo;
}

/** Priority used to pick a single dominant status for a day cell. */
export const STATUS_PRIORITY: SlotStatus[] = [
  "booked",
  "blocked",
  "pending",
  "available",
];

export const STATUS_META: Record<
  SlotStatus,
  { label: string; dot: string; soft: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-success",
    soft: "bg-success/15",
    text: "text-success",
  },
  booked: {
    label: "Booked",
    dot: "bg-primary",
    soft: "bg-primary/15",
    text: "text-primary",
  },
  pending: {
    label: "Pending",
    dot: "bg-warning",
    soft: "bg-warning/15",
    text: "text-warning-foreground dark:text-warning",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-destructive",
    soft: "bg-destructive/15",
    text: "text-destructive",
  },
};

export const STATUS_ORDER: SlotStatus[] = [
  "available",
  "booked",
  "pending",
  "blocked",
];
