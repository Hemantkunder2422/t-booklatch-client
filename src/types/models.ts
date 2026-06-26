/**
 * Domain models & enums — mirror the Prisma schema (source of truth).
 * Only schema fields are kept here; UI-only extras live in their feature.
 */

// ── Enums (string unions matching Prisma) ───────────────────────────
export type UserType = "VENDOR" | "VENUE" | "ADMIN";

export type Role =
  | "VENDOR_ADMIN"
  | "VENDOR_STAFF"
  | "VENUE_ADMIN"
  | "VENUE_STAFF"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUPPORT";

export type VendorType = "FOOD" | "DECOR" | "PHOTOGRAPHY" | "MUSIC";

export type EventType =
  | "WEDDING"
  | "BIRTHDAY"
  | "RECEPTION"
  | "CORPORATE"
  | "OTHERS";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";

export type CalendarStatus = "AVAILABLE" | "BOOKED" | "BLOCKED" | "MAINTENANCE";

export type BookingSlot = "MORNING" | "EVENING" | "FULL_DAY";

export type BookingSource = "INTERNAL" | "PHONE" | "WHATSAPP" | "CUSTOMER_APP";

export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "CONVERTED"
  | "CLOSED";

// ── Display labels ──────────────────────────────────────────────────
export const BOOKING_SLOT_LABELS: Record<BookingSlot, string> = {
  MORNING: "Morning",
  EVENING: "Evening",
  FULL_DAY: "Full day",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  RECEPTION: "Reception",
  CORPORATE: "Corporate",
  OTHERS: "Other",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  INTERNAL: "Internal",
  PHONE: "Phone",
  WHATSAPP: "WhatsApp",
  CUSTOMER_APP: "Customer app",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const CALENDAR_STATUS_LABELS: Record<CalendarStatus, string> = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  BLOCKED: "Blocked",
  MAINTENANCE: "Maintenance",
};

export const ROLE_LABELS: Record<Role, string> = {
  VENDOR_ADMIN: "Vendor Admin",
  VENDOR_STAFF: "Vendor Staff",
  VENUE_ADMIN: "Venue Admin",
  VENUE_STAFF: "Venue Staff",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT: "Support",
};

// ── Models ──────────────────────────────────────────────────────────
export interface Venue {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  capacity?: number;
  priceRange?: string;
  isActive: boolean;
  isVerified: boolean;
  gallery: string[];
}

export interface VenueSpace {
  id: string;
  venueId: string;
  name: string;
  description: string;
  morningSlotEnabled: boolean;
  eveningSlotEnabled: boolean;
  fullDaySlotEnabled: boolean;
  pax: number;
  gallery: string[];
}

export interface Booking {
  id: string;
  venueId: string;
  venueSpaceId: string;
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
  createdById?: string;
}

export interface BookingEnquiry {
  id: string;
  venueId: string;
  venueSpaceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventName?: string;
  eventType?: EventType;
  bookingDate: string;
  slot: BookingSlot;
  status: EnquiryStatus;
  source: BookingSource;
  pax?: number;
  notes?: string;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  role: Role;
  venueId?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
}

export interface VenueSpaceCalendarEntry {
  id: string;
  venueSpaceId: string;
  date: string;
  slot: BookingSlot;
  status: CalendarStatus;
  notes?: string;
  bookingId?: string;
}
