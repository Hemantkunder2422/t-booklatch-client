"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  CalendarClock,
  Check,
  DoorOpen,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
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
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  BOOKING_SLOT_LABELS,
  EVENT_TYPE_LABELS,
  type BookingSlot,
  type EventType,
} from "@/types/models";

type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";

interface QuoteItem {
  description: string;
  qty: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  venueSpaceName: string;
  eventName: string;
  eventType: EventType;
  bookingDate: string;
  slot: BookingSlot;
  items: QuoteItem[];
  gstRate: number;
  validUntil: string;
  status: QuoteStatus;
  notes?: string;
}

const SPACES = [
  "Grand Atrium Hall",
  "Riverside Pavilion",
  "The Glasshouse Loft",
  "Skyline Rooftop",
];
const GST_RATES = [0, 5, 12, 18, 28];
const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];
const SLOTS = Object.keys(BOOKING_SLOT_LABELS) as BookingSlot[];

const STATUS_META: Record<QuoteStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  SENT: { label: "Sent", className: "bg-primary/15 text-primary" },
  ACCEPTED: { label: "Accepted", className: "bg-success/15 text-success" },
  DECLINED: { label: "Declined", className: "bg-destructive/10 text-destructive" },
  EXPIRED: {
    label: "Expired",
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
};

const lineAmount = (i: { qty: number; unitPrice: number }) =>
  (Number(i.qty) || 0) * (Number(i.unitPrice) || 0);
const sumItems = (items: { qty: number; unitPrice: number }[]) =>
  items.reduce((s, i) => s + lineAmount(i), 0);
const quoteTotal = (q: Quote) => sumItems(q.items) * (1 + q.gstRate / 100);

const INITIAL: Quote[] = [
  {
    id: "QT-3012",
    customerName: "Hannah Brooks",
    customerPhone: "+14155550123",
    customerEmail: "hannah.brooks@gmail.com",
    venueSpaceName: "Grand Atrium Hall",
    eventName: "Brooks Wedding",
    eventType: "WEDDING",
    bookingDate: "2026-09-12",
    slot: "EVENING",
    items: [
      { description: "Venue rental — full day", qty: 1, unitPrice: 42000 },
      { description: "Plated dinner (per guest)", qty: 160, unitPrice: 650 },
    ],
    gstRate: 18,
    validUntil: "2026-07-20",
    status: "SENT",
  },
  {
    id: "QT-3011",
    customerName: "Theo Lambert",
    customerPhone: "+14155550199",
    customerEmail: "theo@brightlabs.io",
    venueSpaceName: "Riverside Pavilion",
    eventName: "Bright Labs Offsite",
    eventType: "CORPORATE",
    bookingDate: "2026-07-30",
    slot: "FULL_DAY",
    items: [{ description: "Full-day conference package", qty: 1, unitPrice: 54000 }],
    gstRate: 18,
    validUntil: "2026-07-15",
    status: "ACCEPTED",
  },
  {
    id: "QT-3010",
    customerName: "Maria Santos",
    customerPhone: "+14155550110",
    customerEmail: "maria.santos@outlook.com",
    venueSpaceName: "Skyline Rooftop",
    eventName: "30th Birthday",
    eventType: "BIRTHDAY",
    bookingDate: "2026-08-02",
    slot: "EVENING",
    items: [{ description: "Rooftop evening hire", qty: 1, unitPrice: 31000 }],
    gstRate: 18,
    validUntil: "2026-07-01",
    status: "DRAFT",
  },
];

const quoteItemSchema = z.object({
  description: z.string().trim().min(1, "Required"),
  qty: z.string().trim().min(1, "Qty"),
  unitPrice: z.string().trim().min(1, "Price"),
});

const quoteSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name is required"),
  customerPhone: z.string().trim().min(1, "Phone is required"),
  customerEmail: z.string().min(1, "Email is required").email("Enter a valid email"),
  venueSpaceName: z.string().min(1, "Select a space"),
  eventName: z.string().trim().min(1, "Add an event name"),
  eventType: z.enum(["WEDDING", "BIRTHDAY", "RECEPTION", "CORPORATE", "OTHERS"]),
  bookingDate: z.string().min(1, "Pick a date"),
  slot: z.enum(["MORNING", "EVENING", "FULL_DAY"]),
  gstRate: z.string().min(1, "Select GST"),
  validUntil: z.string().min(1, "Pick a validity date"),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Add at least one line item"),
});
type QuoteValues = z.infer<typeof quoteSchema>;

let quoteCounter = 3013;

export function QuotesView() {
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<Quote | null>(null);

  const counts = useMemo(
    () => ({
      sent: quotes.filter((q) => q.status === "SENT").length,
      accepted: quotes.filter((q) => q.status === "ACCEPTED").length,
      value: quotes
        .filter((q) => q.status === "SENT" || q.status === "ACCEPTED")
        .reduce((s, q) => s + quoteTotal(q), 0),
    }),
    [quotes],
  );

  const filtered = useMemo(
    () =>
      quotes.filter((q) => {
        const s = query.toLowerCase();
        return (
          q.customerName.toLowerCase().includes(s) ||
          q.eventName.toLowerCase().includes(s) ||
          q.id.toLowerCase().includes(s)
        );
      }),
    [quotes, query],
  );

  function handleCreate(values: QuoteValues) {
    const quote: Quote = {
      id: `QT-${quoteCounter++}`,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      venueSpaceName: values.venueSpaceName,
      eventName: values.eventName,
      eventType: values.eventType,
      bookingDate: values.bookingDate,
      slot: values.slot,
      gstRate: Number(values.gstRate) || 0,
      validUntil: values.validUntil,
      status: "DRAFT",
      notes: values.notes || undefined,
      items: values.items.map((i) => ({
        description: i.description,
        qty: Number(i.qty) || 0,
        unitPrice: Number(i.unitPrice) || 0,
      })),
    };
    setQuotes((prev) => [quote, ...prev]);
    setCreateOpen(false);
    toast.success("Quote created", { description: quote.id });
  }

  function setStatus(id: string, status: QuoteStatus) {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    setActive((curr) => (curr?.id === id ? { ...curr, status } : curr));
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Send price quotes to customers and turn them into bookings.
          </p>
        </div>
        <NewQuoteSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sent" value={String(counts.sent)} className="text-primary" />
        <StatCard
          label="Accepted"
          value={String(counts.accepted)}
          className="text-success"
        />
        <StatCard label="Quoted value" value={formatCurrency(counts.value)} />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search quotes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Customer / Event</TableHead>
              <TableHead className="hidden md:table-cell">Space</TableHead>
              <TableHead className="hidden lg:table-cell">Valid until</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No quotes found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((q) => (
                <TableRow
                  key={q.id}
                  className="cursor-pointer"
                  onClick={() => setActive(q)}
                >
                  <TableCell>
                    <div className="font-medium">{q.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {q.eventName} · {q.id}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm md:table-cell">
                    {q.venueSpaceName}
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">
                    {formatDate(q.validUntil)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(quoteTotal(q))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_META[q.status].className,
                      )}
                    >
                      {STATUS_META[q.status].label}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuoteDetailsDialog
        quote={active}
        onOpenChange={(open) => !open && setActive(null)}
        onSetStatus={setStatus}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
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

const EMPTY_VALUES: QuoteValues = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  venueSpaceName: "",
  eventName: "",
  eventType: "WEDDING",
  bookingDate: "",
  slot: "EVENING",
  gstRate: "18",
  validUntil: "",
  notes: "",
  items: [{ description: "", qty: "1", unitPrice: "" }],
};

function NewQuoteSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuoteValues) => void;
}) {
  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: EMPTY_VALUES,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({ control: form.control, name: "items" }) ?? [];
  const watchedRate = useWatch({ control: form.control, name: "gstRate" }) ?? "0";
  const subtotal = watchedItems.reduce(
    (s, i) => s + (Number(i?.qty) || 0) * (Number(i?.unitPrice) || 0),
    0,
  );
  const gst = subtotal * ((Number(watchedRate) || 0) / 100);
  const total = subtotal + gst;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset(EMPTY_VALUES);
      }}
    >
      <SheetTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          New quote
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create quote</SheetTitle>
          <SheetDescription>
            Build a price quote to send to your customer.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="quote-form"
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
                <FormField
                  control={form.control}
                  name="venueSpaceName"
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
                <div className="grid grid-cols-2 gap-2">
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
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Line items</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() =>
                      append({ description: "", qty: "1", unitPrice: "" })
                    }
                  >
                    <Plus className="size-3.5" />
                    Add item
                  </Button>
                </div>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field: f }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Description" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field: f }) => (
                          <FormItem className="w-16">
                            <FormControl>
                              <Input
                                inputMode="numeric"
                                placeholder="Qty"
                                {...f}
                                onChange={(e) =>
                                  f.onChange(e.target.value.replace(/[^0-9]/g, ""))
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: f }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input
                                inputMode="numeric"
                                placeholder="Price"
                                {...f}
                                onChange={(e) =>
                                  f.onChange(
                                    e.target.value.replace(/[^0-9.]/g, ""),
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.items?.message && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.items.message}
                  </p>
                )}
              </div>

              {/* GST + validity + totals */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gstRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST rate</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GST_RATES.map((r) => (
                            <SelectItem key={r} value={String(r)}>
                              {r}%
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
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid until</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / terms</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Optional terms or a personal note…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="quote-form">
            Create quote
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function QuoteDetailsDialog({
  quote,
  onOpenChange,
  onSetStatus,
}: {
  quote: Quote | null;
  onOpenChange: (open: boolean) => void;
  onSetStatus: (id: string, status: QuoteStatus) => void;
}) {
  if (!quote) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const subtotal = sumItems(quote.items);
  const gst = subtotal * (quote.gstRate / 100);
  const total = subtotal + gst;

  const quoteLink = `https://quote.booklatch.com/${quote.id.toLowerCase()}`;
  const message = `Hi ${quote.customerName}, here's your quote from BookLatch for ${quote.eventName} at ${quote.venueSpaceName} on ${formatDate(quote.bookingDate)} (${BOOKING_SLOT_LABELS[quote.slot]}). Total: ${formatCurrency(total)}. View & accept: ${quoteLink}`;
  const emailHref = `mailto:${quote.customerEmail}?subject=${encodeURIComponent(
    `Quote ${quote.id} from BookLatch`,
  )}&body=${encodeURIComponent(message)}`;
  const whatsappHref = `https://wa.me/${quote.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <Dialog open={!!quote} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Quote · {quote.id}</DialogTitle>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_META[quote.status].className,
              )}
            >
              {STATUS_META[quote.status].label}
            </span>
          </div>
          <DialogDescription>
            {quote.eventName} · valid until {formatDate(quote.validUntil)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-muted-foreground">For</p>
              <p className="font-medium">{quote.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Event</p>
              <p className="font-medium">
                {EVENT_TYPE_LABELS[quote.eventType]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Meta icon={<DoorOpen className="size-4" />} label="Space">
              {quote.venueSpaceName}
            </Meta>
            <Meta icon={<CalendarClock className="size-4" />} label="When">
              {formatDate(quote.bookingDate)} · {BOOKING_SLOT_LABELS[quote.slot]}
            </Meta>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(lineAmount(item))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST ({quote.gstRate}%)</span>
              <span>{formatCurrency(gst)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {quote.notes && (
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {quote.notes}
            </p>
          )}

          {/* Send this quote */}
          <div className="space-y-2 rounded-xl border p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Send className="size-4" />
              Send this quote
            </p>
            <p className="text-xs text-muted-foreground">
              Sends to {quote.customerName} · {quote.customerPhone}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href={emailHref}
                  onClick={() => onSetStatus(quote.id, "SENT")}
                >
                  <Mail className="size-4" />
                  Email
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSetStatus(quote.id, "SENT")}
                >
                  <WhatsappIcon className="size-4 rounded" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {quote.status !== "ACCEPTED" && (
            <Button
              variant="outline"
              className="gap-1.5 sm:flex-1"
              onClick={() => {
                onSetStatus(quote.id, "DECLINED");
                toast.info("Quote marked as declined");
              }}
            >
              <X className="size-4" />
              Declined
            </Button>
          )}
          {quote.status === "ACCEPTED" ? (
            <Button
              className="gap-1.5 sm:flex-1"
              onClick={() =>
                toast.success("Convert to booking", {
                  description: "Booking flow isn't wired up in this demo.",
                })
              }
            >
              Convert to booking
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="gap-1.5 sm:flex-1"
              onClick={() => {
                onSetStatus(quote.id, "ACCEPTED");
                toast.success("Quote accepted");
              }}
            >
              <Check className="size-4" />
              Mark accepted
            </Button>
          )}
        </DialogFooter>
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
