"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarClock,
  Check,
  CreditCard,
  DoorOpen,
  FileText,
  Plus,
  Printer,
  Receipt,
  Search,
  Smartphone,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
type PayMethod = "UPI" | "Card" | "Cash" | "Bank transfer";

interface Payment {
  id: string;
  amount: number;
  method: PayMethod;
  date: string;
}

interface Booking {
  id: string;
  customer: string;
  space: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
  payments: Payment[];
  invoiceId?: string;
  notes?: string;
}

const SPACES = [
  "Grand Atrium Hall",
  "Riverside Pavilion",
  "The Glasshouse Loft",
  "Skyline Rooftop",
];

const DEPOSIT_PCT = 25;

const PAY_METHODS: { value: PayMethod; icon: LucideIcon }[] = [
  { value: "UPI", icon: Smartphone },
  { value: "Card", icon: CreditCard },
  { value: "Cash", icon: Banknote },
  { value: "Bank transfer", icon: Building2 },
];

const STATUS: Record<BookingStatus, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning-foreground dark:text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);

function payStatus(b: Booking): { label: string; className: string } {
  const paid = paidOf(b);
  if (b.invoiceId || paid >= b.amount)
    return { label: "Paid", className: "text-success" };
  if (paid > 0) return { label: "Advance paid", className: "text-warning-foreground dark:text-warning" };
  return { label: "Unpaid", className: "text-muted-foreground" };
}

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
    invoiceId: "INV-1043",
    payments: [
      { id: "RCPT-5012", amount: 1050, method: "UPI", date: "2026-06-10" },
      { id: "RCPT-5018", amount: 3150, method: "Card", date: "2026-06-20" },
    ],
  },
  {
    id: "BK-2040",
    customer: "Marcus Reid",
    space: "Riverside Pavilion",
    date: "2026-06-27",
    time: "9:00 AM – 5:00 PM",
    amount: 1900,
    status: "confirmed",
    payments: [
      { id: "RCPT-5021", amount: 475, method: "UPI", date: "2026-06-18" },
    ],
  },
  {
    id: "BK-2039",
    customer: "Priya Nair",
    space: "The Glasshouse Loft",
    date: "2026-06-25",
    time: "6:00 PM – 12:00 AM",
    amount: 2600,
    status: "pending",
    payments: [],
  },
];

const bookingSchema = z.object({
  customer: z.string().trim().min(2, "Customer name is required"),
  space: z.string().min(1, "Select a space"),
  date: z.string().min(1, "Pick a date"),
  time: z.string().trim().min(1, "Add a time range"),
  amount: z.string().trim().min(1, "Add an amount"),
  status: z.enum(["confirmed", "pending", "cancelled"]),
  notes: z.string().optional().or(z.literal("")),
});
type BookingValues = z.infer<typeof bookingSchema>;

let bookingCounter = 2042;
let receiptCounter = 5030;
let invoiceCounter = 1044;

type DialogView =
  | { mode: "details"; booking: Booking }
  | { mode: "collect"; booking: Booking }
  | { mode: "doc"; booking: Booking; docType: "receipt" | "invoice"; payment?: Payment }
  | null;

export function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<DialogView>(null);

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
      amount: Number(values.amount.replace(/[^0-9.]/g, "")) || 0,
      status: values.status,
      notes: values.notes || undefined,
      payments: [],
    };
    setBookings((prev) => [booking, ...prev]);
    setCreateOpen(false);
    toast.success("Booking created", { description: booking.id });
  }

  function collectPayment(booking: Booking, amount: number, method: PayMethod) {
    const payment: Payment = {
      id: `RCPT-${receiptCounter++}`,
      amount,
      method,
      date: new Date().toISOString().slice(0, 10),
    };
    const payments = [...booking.payments, payment];
    const paid = payments.reduce((s, p) => s + p.amount, 0);

    let invoiceId = booking.invoiceId;
    let status = booking.status;
    if (paid > 0 && status === "pending") status = "confirmed";

    let invoiceGenerated = false;
    if (paid >= booking.amount && !invoiceId) {
      invoiceId = `INV-${invoiceCounter++}`;
      invoiceGenerated = true;
    }

    const updated: Booking = { ...booking, payments, invoiceId, status };
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
    setView({ mode: "details", booking: updated });

    if (invoiceGenerated) {
      toast.success(`Paid in full — invoice ${invoiceId} generated`);
    } else {
      toast.success(`Receipt ${payment.id} generated`, {
        description: `${formatCurrency(amount)} via ${method}`,
      });
    }
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
              <TableHead className="hidden md:table-cell">Space</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
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
                    onClick={() => setView({ mode: "details", booking })}
                  >
                    <TableCell>
                      <div className="font-medium">{booking.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.id}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      {booking.space}
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {formatDate(booking.date)}
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
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          STATUS[booking.status],
                        )}
                      >
                        {booking.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <BookingDialog
        view={view}
        onClose={() => setView(null)}
        onSetView={setView}
        onCollect={collectPayment}
      />
    </>
  );
}

/* ── Unified booking dialog (details → collect → document) ───────── */

function BookingDialog({
  view,
  onClose,
  onSetView,
  onCollect,
}: {
  view: DialogView;
  onClose: () => void;
  onSetView: (v: DialogView) => void;
  onCollect: (booking: Booking, amount: number, method: PayMethod) => void;
}) {
  return (
    <Dialog open={view !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {view?.mode === "details" && (
          <DetailsView
            booking={view.booking}
            onCollect={() => onSetView({ mode: "collect", booking: view.booking })}
            onViewReceipt={(payment) =>
              onSetView({
                mode: "doc",
                booking: view.booking,
                docType: "receipt",
                payment,
              })
            }
            onViewInvoice={() =>
              onSetView({
                mode: "doc",
                booking: view.booking,
                docType: "invoice",
              })
            }
          />
        )}
        {view?.mode === "collect" && (
          <CollectView
            booking={view.booking}
            onBack={() => onSetView({ mode: "details", booking: view.booking })}
            onCollect={(amount, method) =>
              onCollect(view.booking, amount, method)
            }
          />
        )}
        {view?.mode === "doc" && (
          <DocumentView
            booking={view.booking}
            docType={view.docType}
            payment={view.payment}
            onBack={() => onSetView({ mode: "details", booking: view.booking })}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailsView({
  booking,
  onCollect,
  onViewReceipt,
  onViewInvoice,
}: {
  booking: Booking;
  onCollect: () => void;
  onViewReceipt: (payment: Payment) => void;
  onViewInvoice: () => void;
}) {
  const paid = paidOf(booking);
  const balance = Math.max(0, booking.amount - paid);
  const pct = booking.amount > 0 ? (paid / booking.amount) * 100 : 0;

  return (
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
      </div>

      {/* Payment progress */}
      <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Payment</span>
          <span className="text-muted-foreground">
            {formatCurrency(paid)} of {formatCurrency(booking.amount)}
          </span>
        </div>
        <Progress value={pct} />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {balance > 0
              ? `Balance due ${formatCurrency(balance)}`
              : "Paid in full"}
          </span>
          {balance > 0 && (
            <Button size="sm" onClick={onCollect} className="gap-1.5">
              <Wallet className="size-4" />
              Collect payment
            </Button>
          )}
        </div>
      </div>

      {/* Receipts / invoice */}
      {(booking.payments.length > 0 || booking.invoiceId) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Receipts & documents
          </p>
          <div className="divide-y rounded-xl border">
            {booking.payments.map((payment) => (
              <button
                key={payment.id}
                type="button"
                onClick={() => onViewReceipt(payment)}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Receipt className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{payment.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.method} · {formatDate(payment.date)}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(payment.amount)}
                </span>
              </button>
            ))}
            {booking.invoiceId && (
              <button
                type="button"
                onClick={onViewInvoice}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{booking.invoiceId}</p>
                  <p className="text-xs text-muted-foreground">
                    Invoice · paid in full
                  </p>
                </div>
                <span className="text-xs font-medium text-success">View</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CollectView({
  booking,
  onBack,
  onCollect,
}: {
  booking: Booking;
  onBack: () => void;
  onCollect: (amount: number, method: PayMethod) => void;
}) {
  const paid = paidOf(booking);
  const balance = Math.max(0, booking.amount - paid);
  const advance = Math.round((booking.amount * DEPOSIT_PCT) / 100);
  const suggested = paid === 0 ? Math.min(advance, balance) : balance;

  const [amount, setAmount] = useState(String(suggested));
  const [method, setMethod] = useState<PayMethod>("UPI");

  const value = Math.min(Number(amount) || 0, balance);
  const willComplete = paid + value >= booking.amount;

  return (
    <>
      <DialogHeader>
        <button
          type="button"
          onClick={onBack}
          className="mb-1 flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
        <DialogTitle>Collect payment</DialogTitle>
        <DialogDescription>
          {booking.id} · balance {formatCurrency(balance)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Method */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Payment method</p>
          <div className="grid grid-cols-2 gap-2">
            {PAY_METHODS.map((m) => {
              const selected = method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                    selected
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <m.icon className="size-4" />
                  {m.value}
                  {m.value === "UPI" && (
                    <span className="ml-auto rounded bg-success/15 px-1 text-[10px] font-semibold text-success">
                      Instant
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Amount</p>
            <div className="flex gap-1.5">
              {paid === 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.min(advance, balance)))}
                  className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  Advance {DEPOSIT_PCT}%
                </button>
              )}
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                Full balance
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {willComplete
              ? "This completes the booking — an invoice will be generated."
              : "A receipt will be generated for this advance payment."}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          className="w-full gap-1.5"
          disabled={value <= 0}
          onClick={() => onCollect(value, method)}
        >
          <Check className="size-4" />
          Collect {formatCurrency(value)}
        </Button>
      </DialogFooter>
    </>
  );
}

function DocumentView({
  booking,
  docType,
  payment,
  onBack,
}: {
  booking: Booking;
  docType: "receipt" | "invoice";
  payment?: Payment;
  onBack: () => void;
}) {
  const paid = paidOf(booking);
  const isReceipt = docType === "receipt";
  const docId = isReceipt ? payment?.id : booking.invoiceId;

  return (
    <>
      <DialogHeader>
        <button
          type="button"
          onClick={onBack}
          className="mb-1 flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
        <div className="flex items-center justify-between gap-3">
          <DialogTitle>{isReceipt ? "Receipt" : "Invoice"}</DialogTitle>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isReceipt
                ? "bg-warning/15 text-warning-foreground dark:text-warning"
                : "bg-success/15 text-success",
            )}
          >
            {isReceipt ? "Advance payment" : "Paid in full"}
          </span>
        </div>
        <DialogDescription>{docId}</DialogDescription>
      </DialogHeader>

      {/* Document body */}
      <div className="space-y-4 rounded-xl border p-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-4 text-primary-foreground">
              <Building2 className="size-4" />
            </span>
            <span className="font-semibold">BookLatch</span>
          </div>
          <span className="text-xs text-muted-foreground">{booking.id}</span>
        </div>
        <Separator />

        <div className="flex justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Billed to</p>
            <p className="font-medium">{booking.customer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {isReceipt ? "Received on" : "Space"}
            </p>
            <p className="font-medium">
              {isReceipt ? formatDate(payment!.date) : booking.space}
            </p>
          </div>
        </div>

        {isReceipt ? (
          <div className="space-y-1.5">
            <DocLine label="Booking total">
              {formatCurrency(booking.amount)}
            </DocLine>
            <DocLine label={`Payment method`}>{payment!.method}</DocLine>
            <Separator />
            <DocLine label="Amount received" strong>
              {formatCurrency(payment!.amount)}
            </DocLine>
            <DocLine label="Balance remaining">
              {formatCurrency(Math.max(0, booking.amount - paid))}
            </DocLine>
          </div>
        ) : (
          <div className="space-y-1.5">
            <DocLine label={`${booking.space} — ${booking.time}`}>
              {formatCurrency(booking.amount)}
            </DocLine>
            {booking.payments.map((p) => (
              <DocLine key={p.id} label={`${p.id} · ${p.method}`} muted>
                −{formatCurrency(p.amount)}
              </DocLine>
            ))}
            <Separator />
            <DocLine label="Total paid" strong>
              {formatCurrency(paid)}
            </DocLine>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          className="w-full gap-1.5"
          onClick={() => toast.info("Download isn't wired up in this demo.")}
        >
          <Printer className="size-4" />
          Download {isReceipt ? "receipt" : "invoice"}
        </Button>
      </DialogFooter>
    </>
  );
}

/* ── Small helpers ───────────────────────────────────────────────── */

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

function DocLine({
  label,
  children,
  strong,
  muted,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        strong && "text-base font-semibold",
        muted && "text-muted-foreground",
      )}
    >
      <span className={cn(!strong && !muted && "text-muted-foreground")}>
        {label}
      </span>
      <span className={cn(!strong && "font-medium")}>{children}</span>
    </div>
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
                    <FormLabel>Total amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="2500"
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
