"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Link2,
  MessageSquare,
  Search,
  Send,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

type PayMethod = "UPI" | "POS" | "CASH" | "LINK";

interface PendingPayment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  venueSpaceName: string;
  eventName: string;
  total: number;
  paid: number;
  dueDate: string;
}

const UPI_ID = "aurora-events@okhdfcbank";
const PAYEE_NAME = "Aurora Events";

const INITIAL: PendingPayment[] = [
  {
    id: "BK-2045",
    customerName: "Theo Lambert",
    customerPhone: "+14155550199",
    customerEmail: "theo@brightlabs.io",
    venueSpaceName: "Riverside Pavilion",
    eventName: "Bright Labs Offsite",
    total: 5400,
    paid: 0,
    dueDate: "2026-06-20",
  },
  {
    id: "BK-2039",
    customerName: "Priya Nair",
    customerPhone: "+14155550110",
    customerEmail: "priya.nair@aurora.org",
    venueSpaceName: "The Glasshouse Loft",
    eventName: "Aurora Foundation Gala",
    total: 2600,
    paid: 0,
    dueDate: "2026-06-25",
  },
  {
    id: "BK-2040",
    customerName: "Marcus Reid",
    customerPhone: "+14155550172",
    customerEmail: "marcus@northwind.io",
    venueSpaceName: "Riverside Pavilion",
    eventName: "Northwind Offsite",
    total: 1900,
    paid: 475,
    dueDate: "2026-06-28",
  },
  {
    id: "BK-2044",
    customerName: "Hannah Brooks",
    customerPhone: "+14155550123",
    customerEmail: "hannah.brooks@gmail.com",
    venueSpaceName: "Grand Atrium Hall",
    eventName: "Brooks Wedding",
    total: 12500,
    paid: 3125,
    dueDate: "2026-07-05",
  },
];

const METHOD_LABELS: Record<PayMethod, string> = {
  UPI: "UPI",
  POS: "Card (POS)",
  CASH: "Cash",
  LINK: "Payment link",
};

const balanceOf = (p: PendingPayment) => p.total - p.paid;

let receiptCounter = 6010;

interface SuccessState {
  amount: number;
  method: PayMethod;
  receiptId: string;
  customerName: string;
}

export function PaymentsView() {
  const [payments, setPayments] = useState<PendingPayment[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [collecting, setCollecting] = useState<PendingPayment | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [collectedToday, setCollectedToday] = useState(0);

  const outstanding = useMemo(
    () => payments.reduce((s, p) => s + balanceOf(p), 0),
    [payments],
  );
  const overdue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return payments.filter((p) => p.dueDate < today).length;
  }, [payments]);

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.customerName.toLowerCase().includes(q) ||
          p.venueSpaceName.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      }),
    [payments, query],
  );

  function handleCollect(
    payment: PendingPayment,
    amount: number,
    method: PayMethod,
  ) {
    const receiptId = `RCPT-${receiptCounter++}`;
    setPayments((prev) =>
      prev
        .map((p) =>
          p.id === payment.id ? { ...p, paid: p.paid + amount } : p,
        )
        .filter((p) => balanceOf(p) > 0),
    );
    setCollectedToday((c) => c + amount);
    setCollecting(null);
    setSuccess({
      amount,
      method,
      receiptId,
      customerName: payment.customerName,
    });
  }

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Collect pending payments from your customers.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} />
        <StatCard
          label="Overdue"
          value={String(overdue)}
          className="text-destructive"
        />
        <StatCard
          label="Collected today"
          value={formatCurrency(collectedToday)}
          className="text-success"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pending list */}
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Booking</TableHead>
              <TableHead className="hidden lg:table-cell">Due</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No pending payments. You&apos;re all caught up. 🎉
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const today = new Date().toISOString().slice(0, 10);
                const isOverdue = p.dueDate < today;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-muted text-xs font-medium">
                            {getInitials(p.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {p.customerName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.eventName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      {p.venueSpaceName}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className={cn(
                          "text-sm",
                          isOverdue
                            ? "font-medium text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatDate(p.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatCurrency(balanceOf(p))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {formatCurrency(p.total)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setCollecting(p)}
                      >
                        <Wallet className="size-4" />
                        Collect
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Collect sheet */}
      <Sheet
        open={!!collecting}
        onOpenChange={(o) => !o && setCollecting(null)}
      >
        <SheetContent className="w-full gap-0 sm:max-w-md">
          {collecting && (
            <CollectPanel
              key={collecting.id}
              payment={collecting}
              onCollect={handleCollect}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Success popup */}
      <PaymentSuccessDialog
        success={success}
        onClose={() => setSuccess(null)}
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

function CollectPanel({
  payment,
  onCollect,
}: {
  payment: PendingPayment;
  onCollect: (
    payment: PendingPayment,
    amount: number,
    method: PayMethod,
  ) => void;
}) {
  const balance = balanceOf(payment);
  const [amount, setAmount] = useState(String(balance));
  const [link, setLink] = useState<string | null>(null);

  const value = Math.min(Number(amount) || 0, balance);
  const canCollect = value > 0;

  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
    PAYEE_NAME,
  )}&am=${value}&cu=INR&tn=${encodeURIComponent(`Booking ${payment.id}`)}`;

  function generateLink() {
    const url = `https://pay.booklatch.com/${payment.id.toLowerCase()}`;
    setLink(url);
    toast.success("Payment link generated");
  }

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  }

  const linkMessage = link
    ? `Hi ${payment.customerName}, here's your secure payment link for ${payment.eventName}: ${link}`
    : "";
  const phoneDigits = payment.customerPhone.replace(/[^0-9]/g, "");
  const smsHref = `sms:${payment.customerPhone}?&body=${encodeURIComponent(linkMessage)}`;
  const whatsappHref = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(linkMessage)}`;

  return (
    <>
      <SheetHeader>
        <SheetTitle>Collect payment</SheetTitle>
        <SheetDescription>
          {payment.id} · {payment.eventName}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {/* Customer + balance */}
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
              {getInitials(payment.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {payment.customerName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Balance due {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Amount</p>
            <button
              type="button"
              onClick={() => setAmount(String(balance))}
              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              Full balance
            </button>
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
              className="pl-7"
            />
          </div>
        </div>

        {/* Method tabs */}
        <Tabs defaultValue="upi" className="gap-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upi">UPI</TabsTrigger>
            <TabsTrigger value="pos">POS</TabsTrigger>
            <TabsTrigger value="cash">Cash</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>

          {/* UPI */}
          <TabsContent value="upi" className="space-y-3">
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
                onClick={() => copy(UPI_ID, "UPI ID")}
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-muted"
              >
                <Smartphone className="size-3.5" />
                {UPI_ID}
                <Copy className="size-3" />
              </button>
            </div>
            <Button
              className="w-full gap-1.5"
              disabled={!canCollect}
              onClick={() => onCollect(payment, value, "UPI")}
            >
              <Check className="size-4" />
              Mark as received · {formatCurrency(value)}
            </Button>
          </TabsContent>

          {/* POS */}
          <TabsContent value="pos" className="space-y-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-6" />
              </span>
              <p className="text-sm font-medium">
                Charge {formatCurrency(value)} on your POS terminal
              </p>
              <p className="text-xs text-muted-foreground">
                Swipe, insert, or tap the customer&apos;s card, then confirm
                below.
              </p>
            </div>
            <Button
              className="w-full gap-1.5"
              disabled={!canCollect}
              onClick={() => onCollect(payment, value, "POS")}
            >
              <Check className="size-4" />
              Card charged · {formatCurrency(value)}
            </Button>
          </TabsContent>

          {/* Cash */}
          <TabsContent value="cash" className="space-y-3">
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
            <Button
              className="w-full gap-1.5"
              disabled={!canCollect}
              onClick={() => onCollect(payment, value, "CASH")}
            >
              <Check className="size-4" />
              Mark as paid (cash) · {formatCurrency(value)}
            </Button>
          </TabsContent>

          {/* Link */}
          <TabsContent value="link" className="space-y-3">
            {!link ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4">
                  <Link2 className="size-6" />
                </span>
                <p className="text-sm font-medium">Send a payment link</p>
                <p className="text-xs text-muted-foreground">
                  Generate a secure link and send it to the customer by text or
                  WhatsApp.
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
                  Sends the link to{" "}
                  <span className="font-medium text-foreground">
                    {payment.customerName}
                  </span>{" "}
                  · {payment.customerPhone}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={smsHref}>
                      <MessageSquare className="size-4" />
                      Text message
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
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
                <p className="text-xs text-muted-foreground">
                  Once the customer pays, mark the payment as paid to generate
                  their receipt.
                </p>
              </div>
            )}
            <Button
              className="w-full gap-1.5"
              disabled={!canCollect || !link}
              onClick={() => onCollect(payment, value, "LINK")}
            >
              <Check className="size-4" />
              Mark as paid · {formatCurrency(value)}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function PaymentSuccessDialog({
  success,
  onClose,
}: {
  success: SuccessState | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!success} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        {success && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/25" />
              <span className="relative flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="size-9" />
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Payment received
              </h2>
              <p className="text-3xl font-bold tracking-tight">
                {formatCurrency(success.amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                from {success.customerName} · {METHOD_LABELS[success.method]}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Receipt {success.receiptId}
            </div>
          </div>
        )}
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={() => toast.info("Download isn't wired up in this demo.")}
          >
            Download receipt
          </Button>
          <Button className="sm:flex-1" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
