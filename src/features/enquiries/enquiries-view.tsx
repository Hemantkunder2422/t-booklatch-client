"use client";

import { useMemo, useState } from "react";
import { CalendarClock, DoorOpen, Mail, Phone, Search, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDate, getInitials } from "@/lib/utils";
import {
  BOOKING_SLOT_LABELS,
  BOOKING_SOURCE_LABELS,
  ENQUIRY_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  type BookingSlot,
  type BookingSource,
  type EnquiryStatus,
  type EventType,
} from "@/types/models";

interface Enquiry {
  id: string;
  venueSpaceName: string;
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

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  NEW: "bg-primary/15 text-primary",
  CONTACTED: "bg-warning/15 text-warning-foreground dark:text-warning",
  FOLLOW_UP: "bg-chart-3/15 text-chart-3",
  CONVERTED: "bg-success/15 text-success",
  CLOSED: "bg-muted text-muted-foreground",
};

const INITIAL: Enquiry[] = [
  {
    id: "EN-318",
    venueSpaceName: "Grand Atrium Hall",
    customerName: "Hannah Brooks",
    customerPhone: "+14155550123",
    customerEmail: "hannah.brooks@gmail.com",
    eventName: "Brooks Wedding",
    eventType: "WEDDING",
    bookingDate: "2026-09-12",
    slot: "EVENING",
    status: "NEW",
    source: "CUSTOMER_APP",
    pax: 160,
    createdAt: "2026-06-21",
    notes:
      "Hi! We're planning a wedding for ~160 guests and loved the Atrium photos. Is it available in September, and what's included for catering?",
  },
  {
    id: "EN-317",
    venueSpaceName: "Riverside Pavilion",
    customerName: "Theo Lambert",
    customerPhone: "+14155550199",
    customerEmail: "theo@brightlabs.io",
    eventName: "Bright Labs Offsite",
    eventType: "CORPORATE",
    bookingDate: "2026-07-30",
    slot: "FULL_DAY",
    status: "CONTACTED",
    source: "PHONE",
    pax: 40,
    createdAt: "2026-06-20",
    notes:
      "Looking for a full-day offsite for 40 people with AV and lunch. Could you share pricing?",
  },
  {
    id: "EN-316",
    venueSpaceName: "Skyline Rooftop",
    customerName: "Maria Santos",
    customerPhone: "+14155550110",
    customerEmail: "maria.santos@outlook.com",
    eventName: "30th Birthday",
    eventType: "BIRTHDAY",
    bookingDate: "2026-08-02",
    slot: "EVENING",
    status: "FOLLOW_UP",
    source: "WHATSAPP",
    pax: 50,
    createdAt: "2026-06-18",
    notes: "Rooftop for a 30th birthday, ~50 guests, evening preferred.",
  },
  {
    id: "EN-315",
    venueSpaceName: "The Glasshouse Loft",
    customerName: "Greg Maddox",
    customerPhone: "+14155550144",
    customerEmail: "greg@maddoxco.com",
    eventName: "Product Launch",
    eventType: "CORPORATE",
    bookingDate: "2026-07-15",
    slot: "EVENING",
    status: "CLOSED",
    source: "INTERNAL",
    pax: 90,
    createdAt: "2026-06-15",
    notes: "Needed a launch venue but we've gone another direction. Thanks!",
  },
];

export function EnquiriesView() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Enquiry | null>(null);

  const counts = useMemo(
    () => ({
      new: enquiries.filter((e) => e.status === "NEW").length,
      followUp: enquiries.filter((e) => e.status === "FOLLOW_UP").length,
      converted: enquiries.filter((e) => e.status === "CONVERTED").length,
    }),
    [enquiries],
  );

  const filtered = useMemo(
    () =>
      enquiries.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.customerName.toLowerCase().includes(q) ||
          (e.eventName?.toLowerCase().includes(q) ?? false) ||
          e.venueSpaceName.toLowerCase().includes(q)
        );
      }),
    [enquiries, query],
  );

  function setStatus(id: string, status: EnquiryStatus) {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e)),
    );
    setActive((curr) => (curr && curr.id === id ? { ...curr, status } : curr));
  }

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
        <p className="text-muted-foreground">
          Incoming requests from prospective customers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="New" value={counts.new} className="text-primary" />
        <SummaryCard
          label="Follow-up"
          value={counts.followUp}
          className="text-chart-3"
        />
        <SummaryCard
          label="Converted"
          value={counts.converted}
          className="text-success"
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search enquiries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>From</TableHead>
              <TableHead className="hidden md:table-cell">Event</TableHead>
              <TableHead className="hidden lg:table-cell">
                Date · Slot
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((enquiry) => (
              <TableRow
                key={enquiry.id}
                className="cursor-pointer"
                onClick={() => setActive(enquiry)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {getInitials(enquiry.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {enquiry.customerName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {enquiry.venueSpaceName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  {enquiry.eventType
                    ? EVENT_TYPE_LABELS[enquiry.eventType]
                    : "—"}
                </TableCell>
                <TableCell className="hidden text-sm lg:table-cell">
                  {formatDate(enquiry.bookingDate)} ·{" "}
                  {BOOKING_SLOT_LABELS[enquiry.slot]}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_STYLE[enquiry.status],
                    )}
                  >
                    {ENQUIRY_STATUS_LABELS[enquiry.status]}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EnquiryDialog
        enquiry={active}
        onOpenChange={(open) => !open && setActive(null)}
        onSetStatus={setStatus}
      />
    </>
  );
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-semibold", className)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function EnquiryDialog({
  enquiry,
  onOpenChange,
  onSetStatus,
}: {
  enquiry: Enquiry | null;
  onOpenChange: (open: boolean) => void;
  onSetStatus: (id: string, status: EnquiryStatus) => void;
}) {
  return (
    <Dialog open={!!enquiry} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {enquiry && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle>{enquiry.customerName}</DialogTitle>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_STYLE[enquiry.status],
                  )}
                >
                  {ENQUIRY_STATUS_LABELS[enquiry.status]}
                </span>
              </div>
              <DialogDescription>
                {enquiry.eventName ?? "Enquiry"} · received{" "}
                {formatDate(enquiry.createdAt)} ·{" "}
                {BOOKING_SOURCE_LABELS[enquiry.source]}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Meta icon={<DoorOpen className="size-4" />} label="Space">
                  {enquiry.venueSpaceName}
                </Meta>
                <Meta
                  icon={<CalendarClock className="size-4" />}
                  label="Preferred"
                >
                  {formatDate(enquiry.bookingDate)} ·{" "}
                  {BOOKING_SLOT_LABELS[enquiry.slot]}
                </Meta>
                <Meta icon={<Users className="size-4" />} label="Guests">
                  {enquiry.pax ?? "—"}
                </Meta>
                <Meta icon={<Phone className="size-4" />} label="Phone">
                  {enquiry.customerPhone}
                </Meta>
              </div>
              {enquiry.notes && (
                <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                  {enquiry.notes}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {enquiry.customerEmail && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${enquiry.customerEmail}`}>
                      <Mail className="size-4" />
                      Reply
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${enquiry.customerPhone}`}>
                    <Phone className="size-4" />
                    Call
                  </a>
                </Button>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => onSetStatus(enquiry.id, "FOLLOW_UP")}
              >
                Mark follow-up
              </Button>
              <Button
                className="sm:flex-1"
                onClick={() => {
                  onSetStatus(enquiry.id, "CONVERTED");
                  toast.success("Enquiry converted", {
                    description: "Create a booking to finish.",
                  });
                }}
              >
                Convert to booking
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{children}</p>
      </div>
    </div>
  );
}
