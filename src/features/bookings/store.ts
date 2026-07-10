import { create } from "zustand";
import { createSelectors } from "@/stores/create-selectors";
import type {
  BookingSlot,
  BookingSource,
  BookingStatus,
  EventType,
} from "@/types/models";

export type PayMethod = "UPI" | "Card" | "Cash" | "Payment link";

export interface Payment {
  id: string;
  amount: number;
  method: PayMethod;
  date: string;
}

export interface Booking {
  id: string;
  venueSpaceId: string;
  venueSpaceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventName: string;
  eventType: EventType;
  bookingDate: string;
  /** Payment due date — drives the "overdue" flag in the Payments worklist. */
  dueDate: string;
  slot: BookingSlot;
  bookingStatus: BookingStatus;
  source: BookingSource;
  pax: number;
  notes?: string;
  amount: number;
  payments: Payment[];
  invoiceId?: string;
}

export const BOOKING_SPACES = [
  { id: "sp-1", name: "Grand Atrium Hall" },
  { id: "sp-2", name: "Riverside Pavilion" },
  { id: "sp-3", name: "The Glasshouse Loft" },
  { id: "sp-4", name: "Skyline Rooftop" },
];

export const STATUS_STYLE: Record<BookingStatus, string> = {
  CONFIRMED: "bg-success/15 text-success",
  PENDING: "bg-warning/15 text-warning-foreground dark:text-warning",
  CANCELLED: "bg-destructive/10 text-destructive",
  COMPLETED: "bg-primary/15 text-primary",
};

export const paidOf = (b: Booking) =>
  b.payments.reduce((s, p) => s + p.amount, 0);

export const balanceOf = (b: Booking) => Math.max(0, b.amount - paidOf(b));

/** Money still owed on a live (non-cancelled) booking. */
export const isOutstanding = (b: Booking) =>
  b.bookingStatus !== "CANCELLED" && balanceOf(b) > 0;

export function payStatus(b: Booking): { label: string; className: string } {
  const paid = paidOf(b);
  if (b.invoiceId || paid >= b.amount)
    return { label: "Paid", className: "text-success" };
  if (paid > 0)
    return {
      label: "Advance paid",
      className: "text-warning-foreground dark:text-warning",
    };
  return { label: "Unpaid", className: "text-muted-foreground" };
}

const INITIAL: Booking[] = [
  {
    id: "BK-2041",
    venueSpaceId: "sp-1",
    venueSpaceName: "Grand Atrium Hall",
    customerName: "Olivia Bennett",
    customerPhone: "+14155550148",
    customerEmail: "olivia.bennett@gmail.com",
    eventName: "Bennett–Cole Wedding",
    eventType: "WEDDING",
    bookingDate: "2026-06-28",
    dueDate: "2026-06-14",
    slot: "EVENING",
    bookingStatus: "CONFIRMED",
    source: "INTERNAL",
    pax: 180,
    notes: "Plated dinner for 180. AV team arrives 2pm.",
    amount: 420000,
    invoiceId: "INV-1043",
    payments: [
      { id: "RCPT-5012", amount: 105000, method: "UPI", date: "2026-06-10" },
      { id: "RCPT-5018", amount: 315000, method: "Card", date: "2026-06-20" },
    ],
  },
  {
    id: "BK-2040",
    venueSpaceId: "sp-2",
    venueSpaceName: "Riverside Pavilion",
    customerName: "Marcus Reid",
    customerPhone: "+14155550172",
    customerEmail: "marcus@northwind.io",
    eventName: "Northwind Offsite",
    eventType: "CORPORATE",
    bookingDate: "2026-07-27",
    dueDate: "2026-07-13",
    slot: "MORNING",
    bookingStatus: "PENDING",
    source: "PHONE",
    pax: 40,
    amount: 190000,
    payments: [
      { id: "RCPT-5021", amount: 47500, method: "UPI", date: "2026-06-18" },
    ],
  },
  {
    id: "BK-2039",
    venueSpaceId: "sp-3",
    venueSpaceName: "The Glasshouse Loft",
    customerName: "Priya Nair",
    customerPhone: "+14155550110",
    customerEmail: "priya.nair@aurora.org",
    eventName: "Aurora Foundation Gala",
    eventType: "RECEPTION",
    bookingDate: "2026-07-25",
    dueDate: "2026-06-25",
    slot: "EVENING",
    bookingStatus: "PENDING",
    source: "WHATSAPP",
    pax: 120,
    amount: 260000,
    payments: [],
  },
  {
    id: "BK-2044",
    venueSpaceId: "sp-1",
    venueSpaceName: "Grand Atrium Hall",
    customerName: "Hannah Brooks",
    customerPhone: "+14155550123",
    customerEmail: "hannah.brooks@gmail.com",
    eventName: "Brooks Wedding",
    eventType: "WEDDING",
    bookingDate: "2026-08-18",
    dueDate: "2026-07-05",
    slot: "FULL_DAY",
    bookingStatus: "PENDING",
    source: "INTERNAL",
    pax: 220,
    amount: 500000,
    payments: [
      { id: "RCPT-5025", amount: 75000, method: "Card", date: "2026-06-28" },
    ],
  },
  {
    id: "BK-2045",
    venueSpaceId: "sp-2",
    venueSpaceName: "Riverside Pavilion",
    customerName: "Theo Lambert",
    customerPhone: "+14155550199",
    customerEmail: "theo@brightlabs.io",
    eventName: "Bright Labs Offsite",
    eventType: "CORPORATE",
    bookingDate: "2026-08-02",
    dueDate: "2026-07-20",
    slot: "FULL_DAY",
    bookingStatus: "PENDING",
    source: "CUSTOMER_APP",
    pax: 60,
    amount: 320000,
    payments: [],
  },
];

export interface NewBookingInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  venueSpaceId: string;
  eventName: string;
  eventType: EventType;
  bookingDate: string;
  dueDate?: string;
  slot: BookingSlot;
  source: BookingSource;
  pax: number;
  amount: number;
  notes?: string;
}

interface CollectResult {
  receiptId: string;
  invoiceGenerated: boolean;
  invoiceId?: string;
  /** True when this payment cleared the balance and confirmed the booking. */
  confirmed: boolean;
}

interface BookingsState {
  bookings: Booking[];
  addBooking: (input: NewBookingInput) => Booking;
  collectPayment: (
    id: string,
    amount: number,
    method: PayMethod,
  ) => CollectResult | null;
  setStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;
}

let bookingCounter = 2046;
let receiptCounter = 5030;
let invoiceCounter = 1044;

const useBookingsStoreBase = create<BookingsState>()((set, get) => ({
  bookings: INITIAL,
  addBooking: (input) => {
    const space = BOOKING_SPACES.find((s) => s.id === input.venueSpaceId);
    const booking: Booking = {
      id: `BK-${bookingCounter++}`,
      venueSpaceId: input.venueSpaceId,
      venueSpaceName: space?.name ?? "",
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      eventName: input.eventName,
      eventType: input.eventType,
      bookingDate: input.bookingDate,
      dueDate: input.dueDate ?? input.bookingDate,
      slot: input.slot,
      // New bookings stay PENDING until the payment is collected in full.
      bookingStatus: "PENDING",
      source: input.source,
      pax: input.pax,
      notes: input.notes,
      amount: input.amount,
      payments: [],
    };
    set((s) => ({ bookings: [booking, ...s.bookings] }));
    return booking;
  },
  collectPayment: (id, amount, method) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return null;

    const payment: Payment = {
      id: `RCPT-${receiptCounter++}`,
      amount,
      method,
      date: new Date().toISOString().slice(0, 10),
    };
    const payments = [...booking.payments, payment];
    const paid = payments.reduce((s, p) => s + p.amount, 0);

    let invoiceId = booking.invoiceId;
    let bookingStatus = booking.bookingStatus;
    let invoiceGenerated = false;
    let confirmed = false;

    // A booking only confirms once it's fully paid; an invoice is generated at
    // the same moment. Advances leave the booking PENDING (receipt only).
    if (paid >= booking.amount) {
      if (bookingStatus === "PENDING") {
        bookingStatus = "CONFIRMED";
        confirmed = true;
      }
      if (!invoiceId) {
        invoiceId = `INV-${invoiceCounter++}`;
        invoiceGenerated = true;
      }
    }

    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, payments, invoiceId, bookingStatus } : b,
      ),
    }));
    return { receiptId: payment.id, invoiceGenerated, invoiceId, confirmed };
  },
  setStatus: (id, bookingStatus) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, bookingStatus } : b,
      ),
    })),
  // Cancelling releases the slot; the calendar derives availability from
  // bookings, so a cancelled booking automatically frees its slot there.
  cancelBooking: (id) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, bookingStatus: "CANCELLED" } : b,
      ),
    })),
}));

export const useBookingsStore = createSelectors(useBookingsStoreBase);
