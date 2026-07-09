"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  BOOKING_SLOT_LABELS,
  BOOKING_SOURCE_LABELS,
  BOOKING_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  type BookingSlot,
  type BookingSource,
  type BookingStatus,
  type EventType,
} from "@/types/models";
import {
  BOOKING_SPACES,
  payStatus,
  STATUS_STYLE,
  useBookingsStore,
  type NewBookingInput,
} from "./store";

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];
const SLOTS = Object.keys(BOOKING_SLOT_LABELS) as BookingSlot[];
const SOURCES = Object.keys(BOOKING_SOURCE_LABELS) as BookingSource[];

const bookingSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name is required"),
  customerPhone: z.string().trim().min(1, "Phone is required"),
  customerEmail: z.string().min(1, "Email is required").email("Enter a valid email"),
  venueSpaceId: z.string().min(1, "Select a space"),
  eventName: z.string().trim().min(1, "Add an event name"),
  eventType: z.enum(["WEDDING", "BIRTHDAY", "RECEPTION", "CORPORATE", "OTHERS"]),
  bookingDate: z.string().min(1, "Pick a date"),
  slot: z.enum(["MORNING", "EVENING", "FULL_DAY"]),
  pax: z.string().trim().min(1, "Add guest count"),
  amount: z.string().trim().min(1, "Add an amount"),
  source: z.enum(["INTERNAL", "PHONE", "WHATSAPP", "CUSTOMER_APP"]),
  notes: z.string().optional().or(z.literal("")),
});
type BookingValues = z.infer<typeof bookingSchema>;

export function BookingsView() {
  const router = useRouter();
  const bookings = useBookingsStore((s) => s.bookings);
  const addBooking = useBookingsStore((s) => s.addBooking);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        const q = query.toLowerCase();
        const matchesQuery =
          b.customerName.toLowerCase().includes(q) ||
          b.venueSpaceName.toLowerCase().includes(q) ||
          b.eventName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "all" || b.bookingStatus === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [bookings, query, statusFilter],
  );

  function handleCreate(values: BookingValues) {
    const input: NewBookingInput = {
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      venueSpaceId: values.venueSpaceId,
      eventName: values.eventName,
      eventType: values.eventType,
      bookingDate: values.bookingDate,
      slot: values.slot,
      source: values.source,
      pax: Number(values.pax.replace(/[^0-9]/g, "")) || 0,
      amount: Number(values.amount.replace(/[^0-9.]/g, "")) || 0,
      notes: values.notes || undefined,
    };
    const created = addBooking(input);
    setCreateOpen(false);
    toast.success("Booking created", { description: created.id });
    router.push(`/bookings/${created.id}`);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage reservations and collect payments.
          </p>
        </div>
        <NewBookingSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer, space, event, or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Customer / Event</TableHead>
              <TableHead className="hidden md:table-cell">Space</TableHead>
              <TableHead className="hidden lg:table-cell">Date · Slot</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No bookings match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((booking) => {
                const ps = payStatus(booking);
                return (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.eventName} ·{" "}
                        {EVENT_TYPE_LABELS[booking.eventType]}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      {booking.venueSpaceName}
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {formatDate(booking.bookingDate)} ·{" "}
                      {BOOKING_SLOT_LABELS[booking.slot]}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatCurrency(booking.amount)}
                      </div>
                      <div className={cn("text-xs", ps.className)}>
                        {ps.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLE[booking.bookingStatus],
                        )}
                      >
                        {BOOKING_STATUS_LABELS[booking.bookingStatus]}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function NewBookingSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BookingValues) => void;
}) {
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      venueSpaceId: "",
      eventName: "",
      eventType: "WEDDING",
      bookingDate: "",
      slot: "EVENING",
      pax: "",
      amount: "",
      source: "INTERNAL",
      notes: "",
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <SheetTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          New booking
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Create booking</SheetTitle>
          <SheetDescription>
            Reserve a space and capture the booking details.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="new-booking-form"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venueSpaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a space" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BOOKING_SPACES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Smith Wedding" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EVENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {EVENT_TYPE_LABELS[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slot</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SLOTS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {BOOKING_SLOT_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guests</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="120"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="250000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/[^0-9.]/g, ""))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {BOOKING_SOURCE_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Optional details…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                New bookings start as <span className="font-medium">Pending</span>{" "}
                — confirm, complete, or cancel them from the booking page.
              </p>
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="new-booking-form">
            Create booking
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
