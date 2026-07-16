"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  DoorOpen,
  FileText,
  Mail,
  Phone,
  Receipt,
  RotateCcw,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { timeRange } from "@/features/calendar/utils";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  BOOKING_SOURCE_LABELS,
  BOOKING_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  type BookingStatus,
} from "@/types/models";
import {
  balanceOf,
  paidOf,
  payStatus,
  STATUS_STYLE,
  useBookingsStore,
  type Booking,
} from "./store";

const STATUS_STEPS: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

export function BookingDetail({ id }: { id: string }) {
  const router = useRouter();
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === id));
  const setStatus = useBookingsStore((s) => s.setStatus);
  const cancelBooking = useBookingsStore((s) => s.cancelBooking);

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
  const balance = balanceOf(booking);
  const pct = booking.amount > 0 ? (paid / booking.amount) * 100 : 0;
  const status = payStatus(booking);
  const canCollect = balance > 0 && booking.bookingStatus !== "CANCELLED";
  const paymentHref = `/payments/${booking.id}`;

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
              <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-lg font-semibold text-primary-foreground">
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
          {canCollect && (
            <Button className="gap-1.5" onClick={() => router.push(paymentHref)}>
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
              <Field
                icon={<CalendarClock className="size-4" />}
                label="Date & time"
              >
                {formatDate(booking.bookingDate)} ·{" "}
                {timeRange(booking.startTime, booking.endTime)}
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
                <span className={cn("text-xs font-medium", status.className)}>
                  {status.label}
                </span>
              </div>
              <Progress value={pct} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {balance > 0
                    ? `Balance ${formatCurrency(balance)} · due ${formatDate(booking.dueDate)}`
                    : "Paid in full"}
                </span>
                <Button
                  size="sm"
                  variant={canCollect ? "default" : "outline"}
                  className="gap-1.5"
                  onClick={() => router.push(paymentHref)}
                >
                  <Wallet className="size-4" />
                  {canCollect ? "Collect payment" : "View payments"}
                </Button>
              </div>
            </div>

            {(booking.payments.length > 0 || booking.invoiceId) && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Receipts & documents
                </p>
                <div className="divide-y rounded-xl border">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center gap-3 p-3"
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
                    </div>
                  ))}
                  {booking.invoiceId && (
                    <div className="flex items-center gap-3 p-3">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        asChild
                      >
                        <Link href="/invoices">Open</Link>
                      </Button>
                    </div>
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
              onCollect={() => router.push(paymentHref)}
              onComplete={() => {
                setStatus(booking.id, "COMPLETED");
                toast.success("Booking marked completed");
              }}
              onReopen={(to) => {
                setStatus(booking.id, to);
                toast.success("Booking reopened");
              }}
              onCancel={() => {
                cancelBooking(booking.id);
                toast.success("Booking cancelled — slot released");
              }}
            />
          </InfoCard>
        </div>
      </div>
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
  onCollect,
  onComplete,
  onReopen,
  onCancel,
}: {
  booking: Booking;
  onCollect: () => void;
  onComplete: () => void;
  onReopen: (to: BookingStatus) => void;
  onCancel: () => void;
}) {
  const status = booking.bookingStatus;
  const cancelled = status === "CANCELLED";
  const currentIndex = STATUS_STEPS.indexOf(status);
  const balance = balanceOf(booking);

  return (
    <div className="space-y-4">
      {cancelled ? (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <XCircle className="size-4" />
          Cancelled — the slot has been released.
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

      {status === "PENDING" && (
        <p className="text-xs text-muted-foreground">
          Collect the full balance of {formatCurrency(balance)} to confirm this
          booking.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <>
            <Button size="sm" className="gap-1.5" onClick={onCollect}>
              <Wallet className="size-4" />
              Collect payment
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={onCancel}
            >
              <XCircle className="size-4" />
              Cancel
            </Button>
          </>
        )}
        {status === "CONFIRMED" && (
          <>
            <Button size="sm" className="gap-1.5" onClick={onComplete}>
              <Check className="size-4" />
              Mark completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={onCancel}
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
            onClick={() => onReopen("CONFIRMED")}
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
            onClick={() => onReopen("PENDING")}
          >
            <RotateCcw className="size-4" />
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
