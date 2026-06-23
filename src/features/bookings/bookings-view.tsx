"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarClock, DoorOpen, Plus, Search, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  customer: string;
  space: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
  notes?: string;
}

const SPACES = [
  "Grand Atrium Hall",
  "Riverside Pavilion",
  "The Glasshouse Loft",
  "Skyline Rooftop",
];

const STATUS: Record<BookingStatus, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning-foreground dark:text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const INITIAL: Booking[] = [
  {
    id: "BK-2041",
    customer: "Olivia Bennett",
    space: "Grand Atrium Hall",
    date: "2026-06-28",
    time: "4:00 PM – 11:00 PM",
    amount: 4200,
    status: "confirmed",
    notes: "Plated dinner for 180.",
  },
  {
    id: "BK-2040",
    customer: "Marcus Reid",
    space: "Riverside Pavilion",
    date: "2026-06-27",
    time: "9:00 AM – 5:00 PM",
    amount: 1900,
    status: "pending",
  },
  {
    id: "BK-2039",
    customer: "Priya Nair",
    space: "The Glasshouse Loft",
    date: "2026-06-25",
    time: "6:00 PM – 12:00 AM",
    amount: 2600,
    status: "confirmed",
  },
  {
    id: "BK-2038",
    customer: "Daniel Cho",
    space: "Skyline Rooftop",
    date: "2026-06-24",
    time: "7:00 PM – 10:00 PM",
    amount: 3100,
    status: "cancelled",
  },
];

const bookingSchema = z.object({
  customer: z.string().trim().min(2, "Customer name is required"),
  space: z.string().min(1, "Select a space"),
  date: z.string().min(1, "Pick a date"),
  time: z.string().trim().min(1, "Add a time range"),
  amount: z.string().optional().or(z.literal("")),
  status: z.enum(["confirmed", "pending", "cancelled"]),
  notes: z.string().optional().or(z.literal("")),
});
type BookingValues = z.infer<typeof bookingSchema>;

let bookingCounter = 2042;

export function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<Booking | null>(null);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        const matchesQuery =
          b.customer.toLowerCase().includes(query.toLowerCase()) ||
          b.space.toLowerCase().includes(query.toLowerCase()) ||
          b.id.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || b.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [bookings, query, statusFilter],
  );

  function handleCreate(values: BookingValues) {
    const booking: Booking = {
      id: `BK-${bookingCounter++}`,
      customer: values.customer,
      space: values.space,
      date: values.date,
      time: values.time,
      amount: Number(values.amount?.replace(/[^0-9.]/g, "")) || 0,
      status: values.status,
      notes: values.notes || undefined,
    };
    setBookings((prev) => [booking, ...prev]);
    setCreateOpen(false);
    toast.success("Booking created", { description: booking.id });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage reservations across all your spaces.
          </p>
        </div>
        <NewBookingDialog
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
            placeholder="Search by customer, space, or ID…"
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
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Booking</TableHead>
              <TableHead>Space</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
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
              filtered.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => setActive(booking)}
                >
                  <TableCell>
                    <div className="font-medium">{booking.customer}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.id}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{booking.space}</TableCell>
                  <TableCell className="hidden text-sm md:table-cell">
                    {formatDate(booking.date)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(booking.amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        STATUS[booking.status],
                      )}
                    >
                      {booking.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BookingDetailsDialog
        booking={active}
        onOpenChange={(open) => !open && setActive(null)}
      />
    </>
  );
}

function NewBookingDialog({
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
      customer: "",
      space: "",
      date: "",
      time: "",
      amount: "",
      status: "pending",
      notes: "",
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          New booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create booking</DialogTitle>
          <DialogDescription>
            Reserve a space and capture the booking details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="new-booking-form"
          >
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="space"
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
                      {SPACES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
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
                name="date"
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
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input placeholder="4:00 PM – 11:00 PM" {...field} />
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
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="2,500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="new-booking-form">
            Create booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingDetailsDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {booking && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle>{booking.customer}</DialogTitle>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    STATUS[booking.status],
                  )}
                >
                  {booking.status}
                </span>
              </div>
              <DialogDescription>{booking.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <Row icon={<DoorOpen className="size-4" />} label="Space">
                {booking.space}
              </Row>
              <Row icon={<CalendarClock className="size-4" />} label="When">
                {formatDate(booking.date)} · {booking.time}
              </Row>
              <Row icon={<User className="size-4" />} label="Customer">
                {booking.customer}
              </Row>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(booking.amount)}
                </span>
              </div>
              {booking.notes && (
                <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  {booking.notes}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
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
