"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarClock,
  Check,
  CheckCheck,
  CreditCard,
  DoorOpen,
  FileText,
  Mail,
  Phone,
  Printer,
  Receipt,
  RotateCcw,
  Smartphone,
  User,
  Users,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  BOOKING_SLOT_LABELS,
  BOOKING_SOURCE_LABELS,
  BOOKING_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  type BookingStatus,
} from "@/types/models";
import {
  paidOf,
  STATUS_STYLE,
  useBookingsStore,
  type Booking,
  type PayMethod,
  type Payment,
} from "./store";

const PAY_METHODS: { value: PayMethod; icon: LucideIcon }[] = [
  { value: "UPI", icon: Smartphone },
  { value: "Card", icon: CreditCard },
  { value: "Cash", icon: Banknote },
  { value: "Bank transfer", icon: Building2 },
];
const DEPOSIT_PCT = 25;
const STATUS_STEPS: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

export function BookingDetail({ id }: { id: string }) {
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === id));
  const collectPayment = useBookingsStore((s) => s.collectPayment);
  const setStatus = useBookingsStore((s) => s.setStatus);

  const [collectOpen, setCollectOpen] = useState(false);
  const [doc, setDoc] = useState<
    { type: "receipt" | "invoice"; payment?: Payment } | null
  >(null);

  if (!booking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold">Booking not found</p>
        <Button variant="outline" asChild>
          <Link href="/bookings">
            <ArrowLeft className="size-4" />
            Back to bookings
          </Link>
        </Button>
      </div>
    );
  }

  const paid = paidOf(booking);
  const balance = Math.max(0, booking.amount - paid);
  const pct = booking.amount > 0 ? (paid / booking.amount) * 100 : 0;

  function handleCollect(amount: number, method: PayMethod) {
    const result = collectPayment(booking!.id, amount, method);
    setCollectOpen(false);
    if (result?.invoiceGenerated) {
      toast.success(`Paid in full — invoice ${result.invoiceId} generated`);
    } else if (result) {
      toast.success(`Receipt ${result.receiptId} generated`, {
        description: `${formatCurrency(amount)} via ${method}`,
      });
    }
  }

  return (
    <>
      {/* Back */}
      <Link
        href="/bookings"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Bookings
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-lg font-semibold text-white">
                {getInitials(booking.customerName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {booking.eventName}
                </h1>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_STYLE[booking.bookingStatus],
                  )}
                >
                  {BOOKING_STATUS_LABELS[booking.bookingStatus]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.customerName} · {booking.id}
              </p>
            </div>
          </div>
          {balance > 0 && booking.bookingStatus !== "CANCELLED" && (
            <Button className="gap-1.5" onClick={() => setCollectOpen(true)}>
              <Wallet className="size-4" />
              Collect {formatCurrency(balance)}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Booking details */}
          <InfoCard title="Booking details">
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field icon={<DoorOpen className="size-4" />} label="Space">
                {booking.venueSpaceName}
              </Field>
              <Field icon={<CalendarClock className="size-4" />} label="Date & slot">
                {formatDate(booking.bookingDate)} ·{" "}
                {BOOKING_SLOT_LABELS[booking.slot]}
              </Field>
              <Field icon={<Users className="size-4" />} label="Guests">
                {booking.pax.toLocaleString()}
              </Field>
              <Field icon={<User className="size-4" />} label="Source">
                {BOOKING_SOURCE_LABELS[booking.source]}
              </Field>
            </div>
            {booking.notes && (
              <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {booking.notes}
              </p>
            )}
          </InfoCard>

          {/* Payment status */}
          <InfoCard title="Payment status">
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {formatCurrency(paid)}{" "}
                  <span className="text-muted-foreground">
                    of {formatCurrency(booking.amount)}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {balance > 0
                    ? `Balance ${formatCurrency(balance)}`
                    : "Paid in full"}
                </span>
              </div>
              <Progress value={pct} />
              {balance > 0 && booking.bookingStatus !== "CANCELLED" && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setCollectOpen(true)}
                >
                  <Wallet className="size-4" />
                  Collect payment
                </Button>
              )}
            </div>

            {(booking.payments.length > 0 || booking.invoiceId) && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Receipts & documents
                </p>
                <div className="divide-y rounded-xl border">
                  {booking.payments.map((payment) => (
                    <button
                      key={payment.id}
                      type="button"
                      onClick={() => setDoc({ type: "receipt", payment })}
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
                      onClick={() => setDoc({ type: "invoice" })}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {booking.invoiceId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invoice · paid in full
                        </p>
                      </div>
                      <span className="text-xs font-medium text-success">
                        View
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </InfoCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer details */}
          <InfoCard title="Customer details">
            <div className="space-y-4">
              <Field icon={<User className="size-4" />} label="Name">
                {booking.customerName}
              </Field>
              <Field
                icon={<CalendarClock className="size-4" />}
                label="Event type"
              >
                {EVENT_TYPE_LABELS[booking.eventType]}
              </Field>
            </div>
          </InfoCard>

          {/* Contact details */}
          <InfoCard title="Contact details">
            <div className="space-y-4">
              <Field icon={<Phone className="size-4" />} label="Phone">
                {booking.customerPhone}
              </Field>
              <Field icon={<Mail className="size-4" />} label="Email">
                <span className="truncate">{booking.customerEmail}</span>
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={`tel:${booking.customerPhone}`}>
                  <Phone className="size-4" />
                  Call
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={`mailto:${booking.customerEmail}`}>
                  <Mail className="size-4" />
                  Email
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsappIcon className="size-4 rounded" />
                  Chat
                </a>
              </Button>
            </div>
          </InfoCard>

          {/* Status lifecycle */}
          <InfoCard title="Status">
            <StatusControl
              booking={booking}
              onSetStatus={(status) => {
                setStatus(booking.id, status);
                toast.success(
                  `Booking ${BOOKING_STATUS_LABELS[status].toLowerCase()}`,
                );
              }}
            />
          </InfoCard>
        </div>
      </div>

      {/* Collect payment sheet */}
      <Sheet open={collectOpen} onOpenChange={setCollectOpen}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          {collectOpen && (
            <CollectPanel booking={booking} onCollect={handleCollect} />
          )}
        </SheetContent>
      </Sheet>

      {/* Document dialog */}
      <Dialog open={!!doc} onOpenChange={(o) => !o && setDoc(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {doc && (
            <DocumentView booking={booking} type={doc.type} payment={doc.payment} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{children}</p>
      </div>
    </div>
  );
}

function StatusControl({
  booking,
  onSetStatus,
}: {
  booking: Booking;
  onSetStatus: (status: BookingStatus) => void;
}) {
  const status = booking.bookingStatus;
  const cancelled = status === "CANCELLED";
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="space-y-4">
      {cancelled ? (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <XCircle className="size-4" />
          This booking was cancelled.
        </div>
      ) : (
        <div className="flex items-center">
          {STATUS_STEPS.map((step, i) => (
            <Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold",
                    i <= currentIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < currentIndex ? <Check className="size-3" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    i <= currentIndex
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {BOOKING_STATUS_LABELS[step]}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-1 mb-4 h-0.5 flex-1 rounded-full",
                    i < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </Fragment>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onSetStatus("CONFIRMED")}
            >
              <CheckCheck className="size-4" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => onSetStatus("CANCELLED")}
            >
              <XCircle className="size-4" />
              Cancel
            </Button>
          </>
        )}
        {status === "CONFIRMED" && (
          <>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onSetStatus("COMPLETED")}
            >
              <Check className="size-4" />
              Mark completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => onSetStatus("CANCELLED")}
            >
              <XCircle className="size-4" />
              Cancel
            </Button>
          </>
        )}
        {status === "COMPLETED" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onSetStatus("CONFIRMED")}
          >
            <RotateCcw className="size-4" />
            Reopen
          </Button>
        )}
        {cancelled && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onSetStatus("PENDING")}
          >
            <RotateCcw className="size-4" />
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}

function CollectPanel({
  booking,
  onCollect,
}: {
  booking: Booking;
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
      <SheetHeader>
        <SheetTitle>Collect payment</SheetTitle>
        <SheetDescription>
          {booking.id} · balance {formatCurrency(balance)}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto px-4">
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
                </button>
              );
            })}
          </div>
        </div>

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
              ₹
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

      <SheetFooter>
        <Button
          className="w-full gap-1.5"
          disabled={value <= 0}
          onClick={() => onCollect(value, method)}
        >
          <Check className="size-4" />
          Collect {formatCurrency(value)}
        </Button>
      </SheetFooter>
    </>
  );
}

function DocumentView({
  booking,
  type,
  payment,
}: {
  booking: Booking;
  type: "receipt" | "invoice";
  payment?: Payment;
}) {
  const paid = paidOf(booking);
  const isReceipt = type === "receipt";

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between gap-3">
          <DialogTitle>{isReceipt ? "Receipt" : "Invoice"}</DialogTitle>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              isReceipt
                ? "bg-warning/15 text-warning-foreground dark:text-warning"
                : "bg-success/15 text-success",
            )}
          >
            {isReceipt ? "Advance payment" : "Paid in full"}
          </span>
        </div>
        <DialogDescription>
          {isReceipt ? payment?.id : booking.invoiceId}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 rounded-xl border p-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-4 text-white">
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
            <p className="font-medium">{booking.customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {isReceipt ? "Received on" : "Space"}
            </p>
            <p className="font-medium">
              {isReceipt ? formatDate(payment!.date) : booking.venueSpaceName}
            </p>
          </div>
        </div>

        {isReceipt ? (
          <div className="space-y-1.5">
            <DocLine label="Booking total">
              {formatCurrency(booking.amount)}
            </DocLine>
            <DocLine label="Payment method">{payment!.method}</DocLine>
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
            <DocLine
              label={`${booking.eventName} — ${BOOKING_SLOT_LABELS[booking.slot]}`}
            >
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
