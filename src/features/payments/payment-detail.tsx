"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  DoorOpen,
  ExternalLink,
  FileText,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  Receipt,
  Send,
  Smartphone,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/stores/settings.store";
import { timeRange } from "@/features/calendar/utils";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  EVENT_TYPE_LABELS,
} from "@/types/models";
import {
  balanceOf,
  paidOf,
  payStatus,
  STATUS_STYLE,
  useBookingsStore,
  type PayMethod,
} from "@/features/bookings/store";

interface ReceiptInfo {
  receiptId: string;
  amount: number;
  method: PayMethod;
  confirmed: boolean;
  invoiceId?: string;
}

export function PaymentDetail({ id }: { id: string }) {
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === id));
  const collectPayment = useBookingsStore((s) => s.collectPayment);
  const settings = useSettingsStore.use.payments();

  const [amount, setAmount] = useState(() => {
    if (!booking) return "0";
    const bal = balanceOf(booking);
    const advance = Math.round((booking.amount * Number(settings.depositPct || 0)) / 100);
    return String(paidOf(booking) === 0 ? Math.min(advance, bal) : bal);
  });
  const [tab, setTab] = useState<PayMethod>("UPI");
  const [link, setLink] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<ReceiptInfo | null>(null);

  if (!booking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold">Payment record not found</p>
        <Button variant="outline" asChild>
          <Link href="/payments">
            <ArrowLeft className="size-4" />
            Back to payments
          </Link>
        </Button>
      </div>
    );
  }

  const paid = paidOf(booking);
  const balance = balanceOf(booking);
  const pct = booking.amount > 0 ? (paid / booking.amount) * 100 : 0;
  const status = payStatus(booking);
  const advance = Math.round(
    (booking.amount * Number(settings.depositPct || 0)) / 100,
  );
  const settled = balance <= 0;
  const cancelled = booking.bookingStatus === "CANCELLED";

  const value = Math.min(Number(amount) || 0, balance);
  const canCollect = value > 0;

  const upiString = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
    settings.payeeName,
  )}&am=${value}&cu=INR&tn=${encodeURIComponent(`Booking ${booking.id}`)}`;

  const phoneDigits = booking.customerPhone.replace(/[^0-9]/g, "");
  const linkMessage = link
    ? `Hi ${booking.customerName}, here's your secure payment link for ${booking.eventName}: ${link}`
    : "";
  const smsHref = `sms:${booking.customerPhone}?&body=${encodeURIComponent(linkMessage)}`;
  const whatsappHref = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(linkMessage)}`;

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  }

  function generateLink() {
    setLink(`https://pay.booklatch.com/${booking!.id.toLowerCase()}`);
    toast.success("Payment link generated");
  }

  function handleCollect(method: PayMethod) {
    const result = collectPayment(booking!.id, value, method);
    if (!result) return;
    setLastReceipt({
      receiptId: result.receiptId,
      amount: value,
      method,
      confirmed: result.confirmed,
      invoiceId: result.invoiceId,
    });
    setAmount("0");
    setLink(null);
    if (result.confirmed) {
      toast.success("Payment complete — booking confirmed", {
        description: `Invoice ${result.invoiceId} generated`,
      });
    } else {
      toast.success(`Receipt ${result.receiptId} generated`, {
        description: `${formatCurrency(value)} via ${method}`,
      });
    }
  }

  return (
    <>
      <Link
        href="/payments"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Payments
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="text-left sm:text-right">
            <p className={cn("text-2xl font-semibold", status.className)}>
              {settled ? formatCurrency(booking.amount) : formatCurrency(balance)}
            </p>
            <p className="text-xs text-muted-foreground">
              {settled ? "Paid in full" : `Balance of ${formatCurrency(booking.amount)}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Due {formatDate(booking.dueDate)}</span>
                <span>·</span>
                <span>Advance {settings.depositPct}% = {formatCurrency(advance)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Collect / settled */}
          {cancelled ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                This booking is cancelled — no payment can be collected.
              </CardContent>
            </Card>
          ) : settled ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="size-8" />
                </span>
                <div>
                  <p className="font-semibold">Payment complete</p>
                  <p className="text-sm text-muted-foreground">
                    This booking is fully paid and confirmed.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collect payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {lastReceipt && (
                  <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <div>
                      <p className="font-medium text-success">
                        {formatCurrency(lastReceipt.amount)} received ·{" "}
                        {lastReceipt.receiptId}
                      </p>
                      <p className="text-muted-foreground">
                        {lastReceipt.confirmed
                          ? `Booking confirmed — invoice ${lastReceipt.invoiceId} generated.`
                          : `Balance remaining ${formatCurrency(balance)}.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Amount</p>
                    <div className="flex gap-1.5">
                      {paid === 0 && advance > 0 && advance < balance && (
                        <QuickFill
                          label={`Advance ${settings.depositPct}%`}
                          onClick={() => setAmount(String(advance))}
                        />
                      )}
                      <QuickFill
                        label="Full balance"
                        onClick={() => setAmount(String(balance))}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      className="pl-7 text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {value >= balance
                      ? "Clears the balance — the booking is confirmed and an invoice is generated."
                      : "Advance payment — a receipt is generated and the booking stays pending."}
                  </p>
                </div>

                {/* Method */}
                <Tabs
                  value={tab}
                  onValueChange={(v) => setTab(v as PayMethod)}
                  className="gap-4"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="UPI">UPI</TabsTrigger>
                    <TabsTrigger value="Card">Card</TabsTrigger>
                    <TabsTrigger value="Cash">Cash</TabsTrigger>
                    <TabsTrigger value="Payment link">Link</TabsTrigger>
                  </TabsList>

                  {/* UPI */}
                  <TabsContent value="UPI" className="space-y-3">
                    {settings.upiEnabled ? (
                      <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
                        <div className="rounded-xl bg-white p-3">
                          <QRCodeSVG
                            value={upiString}
                            size={168}
                            level="M"
                            bgColor="#ffffff"
                            fgColor="#0b0b12"
                          />
                        </div>
                        <p className="text-center text-xs text-muted-foreground">
                          Ask the customer to scan with any UPI app
                          <br />
                          (GPay, PhonePe, Paytm…)
                        </p>
                        <button
                          type="button"
                          onClick={() => copy(settings.upiId, "UPI ID")}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                        >
                          <Smartphone className="size-3.5" />
                          {settings.upiId}
                          <Copy className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <SettingsNotice feature="UPI" />
                    )}
                    <CollectButton
                      disabled={!canCollect || !settings.upiEnabled}
                      label={`Mark as received · ${formatCurrency(value)}`}
                      onClick={() => handleCollect("UPI")}
                    />
                  </TabsContent>

                  {/* Card */}
                  <TabsContent value="Card" className="space-y-3">
                    <div className="flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="size-6" />
                      </span>
                      <p className="text-sm font-medium">
                        Charge {formatCurrency(value)} on your POS terminal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {settings.posConnected
                          ? `Terminal ${settings.posTerminalId || settings.posProvider}. Swipe, insert, or tap, then confirm.`
                          : "Swipe, insert, or tap the customer's card, then confirm below."}
                      </p>
                    </div>
                    <CollectButton
                      disabled={!canCollect}
                      label={`Card charged · ${formatCurrency(value)}`}
                      onClick={() => handleCollect("Card")}
                    />
                  </TabsContent>

                  {/* Cash */}
                  <TabsContent value="Cash" className="space-y-3">
                    <div className="flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
                        <Banknote className="size-6" />
                      </span>
                      <p className="text-sm font-medium">
                        Collect {formatCurrency(value)} in cash
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Record the cash payment and generate a receipt.
                      </p>
                    </div>
                    <CollectButton
                      disabled={!canCollect}
                      label={`Mark as paid (cash) · ${formatCurrency(value)}`}
                      onClick={() => handleCollect("Cash")}
                    />
                  </TabsContent>

                  {/* Link */}
                  <TabsContent value="Payment link" className="space-y-3">
                    {!link ? (
                      <div className="flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4">
                          <Link2 className="size-6" />
                        </span>
                        <p className="text-sm font-medium">Send a payment link</p>
                        <p className="text-xs text-muted-foreground">
                          Generate a secure link and send it by text or WhatsApp.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1 gap-1.5"
                          onClick={generateLink}
                        >
                          <Link2 className="size-4" />
                          Generate link
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-xl border p-4">
                        <div className="flex items-center gap-2">
                          <Input readOnly value={link} className="text-xs" />
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => copy(link, "Link")}
                            aria-label="Copy link"
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                        <p className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                          <Send className="size-3.5 shrink-0" />
                          Sends to{" "}
                          <span className="font-medium text-foreground">
                            {booking.customerName}
                          </span>{" "}
                          · {booking.customerPhone}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            asChild
                          >
                            <a href={smsHref}>
                              <MessageSquare className="size-4" />
                              Text message
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            asChild
                          >
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <WhatsappIcon className="size-4 rounded" />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    <CollectButton
                      disabled={!canCollect || !link}
                      label={`Mark as paid · ${formatCurrency(value)}`}
                      onClick={() => handleCollect("Payment link")}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment history</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.payments.length === 0 && !booking.invoiceId ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No payments collected yet.
                </p>
              ) : (
                <div className="divide-y rounded-xl border">
                  {booking.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Receipt className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{p.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.method} · {formatDate(p.date)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(p.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() =>
                          toast.info("Download isn't wired up in this demo.")
                        }
                      >
                        Receipt
                      </Button>
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
                          Tax invoice · paid in full
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booked by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={<Phone className="size-4" />} label="Phone">
                {booking.customerPhone}
              </InfoRow>
              <InfoRow icon={<Mail className="size-4" />} label="Email">
                <span className="truncate">{booking.customerEmail}</span>
              </InfoRow>
              <div className="grid grid-cols-3 gap-2 pt-1">
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
                    href={`https://wa.me/${phoneDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsappIcon className="size-4 rounded" />
                    Chat
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={<DoorOpen className="size-4" />} label="Space">
                {booking.venueSpaceName}
              </InfoRow>
              <InfoRow
                icon={<CalendarClock className="size-4" />}
                label="Date & time"
              >
                {formatDate(booking.bookingDate)} ·{" "}
                {timeRange(booking.startTime, booking.endTime)}
              </InfoRow>
              <InfoRow
                icon={<CalendarClock className="size-4" />}
                label="Event type"
              >
                {EVENT_TYPE_LABELS[booking.eventType]}
              </InfoRow>
              <InfoRow icon={<Users className="size-4" />} label="Guests">
                {booking.pax.toLocaleString()}
              </InfoRow>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                asChild
              >
                <Link href={`/bookings/${booking.id}`}>
                  <ExternalLink className="size-4" />
                  Open booking
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function QuickFill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
    >
      {label}
    </button>
  );
}

function CollectButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button className="w-full gap-1.5" disabled={disabled} onClick={onClick}>
      <Check className="size-4" />
      {label}
    </Button>
  );
}

function SettingsNotice({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
      <p className="text-sm font-medium">{feature} isn&apos;t enabled</p>
      <p className="text-xs text-muted-foreground">
        Turn it on in payment settings to collect this way.
      </p>
      <Button variant="outline" size="sm" className="mt-1 gap-1.5" asChild>
        <Link href="/settings">Go to settings</Link>
      </Button>
    </div>
  );
}

function InfoRow({
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
