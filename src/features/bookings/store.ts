import { create } from "zustand";
import { createSelectors } from "@/stores/create-selectors";
import type {
  BookingSlot,
  BookingSource,
  BookingStatus,
  EventType,
} from "@/types/models";

export type PayMethod = "UPI" | "Card" | "Cash" | "Bank transfer";

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
    bookingDate: "2026-06-27",
    slot: "MORNING",
    bookingStatus: "CONFIRMED",
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
    bookingDate: "2026-06-25",
    slot: "EVENING",
    bookingStatus: "PENDING",
    source: "WHATSAPP",
    pax: 120,
    amount: 260000,
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
}

let bookingCounter = 2042;
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
      slot: input.slot,
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
    if (paid > 0 && bookingStatus === "PENDING") bookingStatus = "CONFIRMED";

    let invoiceGenerated = false;
    if (paid >= booking.amount && !invoiceId) {
      invoiceId = `INV-${invoiceCounter++}`;
      invoiceGenerated = true;
    }

    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, payments, invoiceId, bookingStatus } : b,
      ),
    }));
    return { receiptId: payment.id, invoiceGenerated, invoiceId };
  },
  setStatus: (id, bookingStatus) =>
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, bookingStatus } : b,
      ),
    })),
}));

export const useBookingsStore = createSelectors(useBookingsStoreBase);
