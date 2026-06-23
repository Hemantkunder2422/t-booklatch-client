"use client";

import { useMemo, useState } from "react";
import { CalendarClock, DoorOpen, Mail, Phone, Search } from "lucide-react";
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

type EnquiryStatus = "new" | "contacted" | "converted" | "closed";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  space: string;
  preferredDate: string;
  receivedAt: string;
  status: EnquiryStatus;
  message: string;
}

const STATUS_META: Record<EnquiryStatus, { label: string; className: string }> =
  {
    new: { label: "New", className: "bg-primary/15 text-primary" },
    contacted: {
      label: "Contacted",
      className: "bg-warning/15 text-warning-foreground dark:text-warning",
    },
    converted: { label: "Converted", className: "bg-success/15 text-success" },
    closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  };

const INITIAL: Enquiry[] = [
  {
    id: "EN-318",
    name: "Hannah Brooks",
    email: "hannah.brooks@gmail.com",
    phone: "+14155550123",
    eventType: "Wedding reception",
    space: "Grand Atrium Hall",
    preferredDate: "2026-09-12",
    receivedAt: "2026-06-21",
    status: "new",
    message:
      "Hi! We're planning a wedding for ~160 guests and loved the Atrium photos. Is it available in September, and what's included for catering?",
  },
  {
    id: "EN-317",
    name: "Theo Lambert",
    email: "theo@brightlabs.io",
    phone: "+14155550199",
    eventType: "Corporate offsite",
    space: "Riverside Pavilion",
    preferredDate: "2026-07-30",
    receivedAt: "2026-06-20",
    status: "contacted",
    message:
      "Looking for a full-day offsite for 40 people with AV and lunch. Could you share pricing?",
  },
  {
    id: "EN-316",
    name: "Maria Santos",
    email: "maria.santos@outlook.com",
    phone: "+14155550110",
    eventType: "Birthday party",
    space: "Skyline Rooftop",
    preferredDate: "2026-08-02",
    receivedAt: "2026-06-18",
    status: "converted",
    message: "Rooftop for a 30th birthday, ~50 guests, evening preferred.",
  },
  {
    id: "EN-315",
    name: "Greg Maddox",
    email: "greg@maddoxco.com",
    phone: "+14155550144",
    eventType: "Product launch",
    space: "The Glasshouse Loft",
    preferredDate: "2026-07-15",
    receivedAt: "2026-06-15",
    status: "closed",
    message: "Needed a launch venue but we've gone another direction. Thanks!",
  },
];

export function EnquiriesView() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Enquiry | null>(null);

  const counts = useMemo(() => {
    return {
      new: enquiries.filter((e) => e.status === "new").length,
      contacted: enquiries.filter((e) => e.status === "contacted").length,
      converted: enquiries.filter((e) => e.status === "converted").length,
    };
  }, [enquiries]);

  const filtered = useMemo(
    () =>
      enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.eventType.toLowerCase().includes(query.toLowerCase()) ||
          e.space.toLowerCase().includes(query.toLowerCase()),
      ),
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="New" value={counts.new} className="text-primary" />
        <SummaryCard
          label="Contacted"
          value={counts.contacted}
          className="text-warning-foreground dark:text-warning"
        />
        <SummaryCard
          label="Converted"
          value={counts.converted}
          className="text-success"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search enquiries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>From</TableHead>
              <TableHead className="hidden md:table-cell">Event</TableHead>
              <TableHead className="hidden lg:table-cell">
                Preferred date
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
                        {getInitials(enquiry.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{enquiry.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {enquiry.space}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  {enquiry.eventType}
                </TableCell>
                <TableCell className="hidden text-sm lg:table-cell">
                  {formatDate(enquiry.preferredDate)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_META[enquiry.status].className,
                    )}
                  >
                    {STATUS_META[enquiry.status].label}
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
                <DialogTitle>{enquiry.name}</DialogTitle>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_META[enquiry.status].className,
                  )}
                >
                  {STATUS_META[enquiry.status].label}
                </span>
              </div>
              <DialogDescription>
                {enquiry.eventType} · received {formatDate(enquiry.receivedAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Meta icon={<DoorOpen className="size-4" />} label="Space">
                  {enquiry.space}
                </Meta>
                <Meta
                  icon={<CalendarClock className="size-4" />}
                  label="Preferred"
                >
                  {formatDate(enquiry.preferredDate)}
                </Meta>
              </div>
              <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                {enquiry.message}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${enquiry.email}`}>
                    <Mail className="size-4" />
                    Reply
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${enquiry.phone}`}>
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
                onClick={() => onSetStatus(enquiry.id, "contacted")}
              >
                Mark contacted
              </Button>
              <Button
                className="sm:flex-1"
                onClick={() => {
                  onSetStatus(enquiry.id, "converted");
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
