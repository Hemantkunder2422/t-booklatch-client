"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Building2,
  CalendarCheck,
  Clock,
  FileSignature,
  FileText,
  Mail,
  Phone,
  Printer,
  Receipt,
  ScrollText,
  UserRoundX,
  UserRoundCheck,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { BOOKING_SLOT_LABELS, BOOKING_STATUS_LABELS } from "@/types/models";
import {
  customerStats,
  useCustomersStore,
  type Customer,
} from "./store";

const PILL: Record<string, string> = {
  paid: "bg-success/15 text-success",
  accepted: "bg-success/15 text-success",
  signed: "bg-success/15 text-success",
  sent: "bg-primary/15 text-primary",
  scheduled: "bg-primary/15 text-primary",
  pending: "bg-warning/15 text-warning-foreground dark:text-warning",
  draft: "bg-muted text-muted-foreground",
  overdue: "bg-destructive/10 text-destructive",
  declined: "bg-destructive/10 text-destructive",
};

function Pill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        PILL[value] ?? "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

type PreviewDoc =
  | { kind: "invoice"; id: string; date: string; amount: number; status: string }
  | { kind: "quote"; id: string; date: string; amount: number; status: string }
  | { kind: "contract"; id: string; title: string; date: string; status: string };

export function CustomerDetail({ id }: { id: string }) {
  const customer = useCustomersStore((s) =>
    s.customers.find((c) => c.id === id),
  );
  const setStatus = useCustomersStore((s) => s.setStatus);
  const [preview, setPreview] = useState<PreviewDoc | null>(null);

  if (!customer) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold">Customer not found</p>
        <Button variant="outline" asChild>
          <Link href="/customers">
            <ArrowLeft className="size-4" />
            Back to customers
          </Link>
        </Button>
      </div>
    );
  }

  const stats = customerStats(customer);

  return (
    <>
      <Link
        href="/customers"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Customers
      </Link>

      {/* Profile header */}
      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-lg font-semibold text-primary-foreground">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {customer.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    customer.status === "active"
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      customer.status === "active"
                        ? "bg-success"
                        : "bg-muted-foreground",
                    )}
                  />
                  {customer.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              {customer.company && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="size-3.5" />
                  {customer.company}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`tel:${customer.phone}`}>
                <Phone className="size-4" />
                Call
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`mailto:${customer.email}`}>
                <Mail className="size-4" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a
                href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsappIcon className="size-4 rounded" />
                WhatsApp
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const next = customer.status === "active" ? "inactive" : "active";
                setStatus(customer.id, next);
                toast.success(`Marked ${next}`);
              }}
            >
              {customer.status === "active" ? (
                <>
                  <UserRoundX className="size-4" />
                  Mark inactive
                </>
              ) : (
                <>
                  <UserRoundCheck className="size-4" />
                  Mark active
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total spent" value={formatCurrency(stats.totalSpent)} />
        <Stat label="Bookings" value={String(stats.bookings)} />
        <Stat
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
          className={stats.outstanding > 0 ? "text-destructive" : undefined}
        />
        <Stat
          label="Last booking"
          value={stats.lastBooking ? formatDate(stats.lastBooking) : "—"}
        />
      </div>

      {/* CRM tabs */}
      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings · {customer.bookings.length}
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments · {customer.payments.length}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices · {customer.invoices.length}
          </TabsTrigger>
          <TabsTrigger value="quotes">
            Quotes · {customer.quotes.length}
          </TabsTrigger>
          <TabsTrigger value="reminders">
            Reminders · {customer.reminders.length}
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Contracts · {customer.contracts.length}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab customer={customer} />
        </TabsContent>

        <TabsContent value="bookings">
          <SectionCard empty={customer.bookings.length === 0} emptyText="No bookings yet.">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Event</TableHead>
                  <TableHead className="hidden sm:table-cell">Date · Slot</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium">{b.eventName}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.space} · {b.id}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm sm:table-cell">
                      {formatDate(b.date)} · {BOOKING_SLOT_LABELS[b.slot]}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(b.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                        {BOOKING_STATUS_LABELS[b.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="payments">
          <SectionCard empty={customer.payments.length === 0} emptyText="No payments recorded.">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Receipt</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell className="text-sm">{p.method}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDate(p.date)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(p.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="invoices">
          <SectionCard empty={customer.invoices.length === 0} emptyText="No invoices yet.">
            <RecordTable
              rows={customer.invoices.map((i) => ({
                id: i.id,
                date: i.date,
                amount: i.amount,
                status: i.status,
              }))}
              onRowClick={(r) => setPreview({ kind: "invoice", ...r })}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="quotes">
          <SectionCard empty={customer.quotes.length === 0} emptyText="No quotes sent.">
            <RecordTable
              rows={customer.quotes.map((q) => ({
                id: q.id,
                date: q.date,
                amount: q.amount,
                status: q.status,
              }))}
              onRowClick={(r) => setPreview({ kind: "quote", ...r })}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="reminders">
          <SectionCard empty={customer.reminders.length === 0} emptyText="No reminders.">
            <div className="divide-y">
              {customer.reminders.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.about}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.channel} · {formatDate(r.date)}
                    </p>
                  </div>
                  <Pill value={r.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="contracts">
          <SectionCard empty={customer.contracts.length === 0} emptyText="No contracts.">
            <div className="divide-y">
              {customer.contracts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setPreview({
                      kind: "contract",
                      id: c.id,
                      title: c.title,
                      date: c.date,
                      status: c.status,
                    })
                  }
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileSignature className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.id} · {formatDate(c.date)}
                    </p>
                  </div>
                  <Pill value={c.status} />
                </button>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <DocumentPreviewDialog
        doc={preview}
        customer={customer}
        onClose={() => setPreview(null)}
      />
    </>
  );
}

function DocumentPreviewDialog({
  doc,
  customer,
  onClose,
}: {
  doc: PreviewDoc | null;
  customer: Customer;
  onClose: () => void;
}) {
  const title =
    doc?.kind === "invoice"
      ? "Invoice"
      : doc?.kind === "quote"
        ? "Quote"
        : "Contract";

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {doc && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle>
                  {title} · {doc.id}
                </DialogTitle>
                <Pill value={doc.status} />
              </div>
              <DialogDescription>
                {doc.kind === "contract" ? doc.title : customer.name} ·{" "}
                {formatDate(doc.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 rounded-xl border p-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-4 text-primary-foreground">
                    <Building2 className="size-4" />
                  </span>
                  <span className="font-semibold">BookLatch</span>
                </div>
                <span className="text-xs text-muted-foreground">{doc.id}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {doc.kind === "contract" ? "Between" : "For"}
                  </p>
                  <p className="font-medium">{customer.name}</p>
                  {customer.company && (
                    <p className="text-xs text-muted-foreground">
                      {customer.company}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {doc.kind === "quote" ? "Valid from" : "Date"}
                  </p>
                  <p className="font-medium">{formatDate(doc.date)}</p>
                </div>
              </div>

              {doc.kind === "contract" ? (
                <div className="space-y-2">
                  <p className="font-medium">{doc.title}</p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Rental of the agreed space for the booked date and slot.</li>
                    <li>Payment terms: deposit on booking, balance before the event.</li>
                    <li>Cancellation &amp; refund policy as per venue terms.</li>
                    <li>Liability, security deposit, and house rules apply.</li>
                  </ul>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <div className="h-8 border-b border-dashed" />
                      <p className="text-xs text-muted-foreground">
                        BookLatch
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-8 border-b border-dashed" />
                      <p className="text-xs text-muted-foreground">
                        {customer.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Venue services</span>
                    <span>{formatCurrency(doc.amount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(doc.amount)}</span>
                  </div>
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
                Download {title.toLowerCase()}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({
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
        <p className={cn("text-xl font-semibold", className)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  empty,
  emptyText,
  children,
}: {
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      {empty ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

type RecordRow = { id: string; date: string; amount: number; status: string };

function RecordTable({
  rows,
  onRowClick,
}: {
  rows: RecordRow[];
  onRowClick?: (row: RecordRow) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead>Reference</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={r.id}
            className={onRowClick ? "cursor-pointer" : undefined}
            onClick={() => onRowClick?.(r)}
          >
            <TableCell className="font-medium">{r.id}</TableCell>
            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
              {formatDate(r.date)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(r.amount)}
            </TableCell>
            <TableCell>
              <Pill value={r.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function OverviewTab({ customer }: { customer: Customer }) {
  // Merge related records into one recent-activity feed.
  const activity = [
    ...customer.bookings.map((b) => ({
      date: b.date,
      icon: CalendarCheck,
      title: `Booking · ${b.eventName}`,
      meta: formatCurrency(b.amount),
    })),
    ...customer.payments.map((p) => ({
      date: p.date,
      icon: Receipt,
      title: `Payment · ${p.method}`,
      meta: formatCurrency(p.amount),
    })),
    ...customer.invoices.map((i) => ({
      date: i.date,
      icon: FileText,
      title: `Invoice ${i.id}`,
      meta: formatCurrency(i.amount),
    })),
    ...customer.quotes.map((q) => ({
      date: q.date,
      icon: ScrollText,
      title: `Quote ${q.id} (${q.status})`,
      meta: formatCurrency(q.amount),
    })),
    ...customer.reminders.map((r) => ({
      date: r.date,
      icon: Bell,
      title: `Reminder · ${r.about}`,
      meta: r.channel,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div className="rounded-xl border">
        <div className="border-b p-4">
          <p className="font-medium">Recent activity</p>
        </div>
        {activity.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <div className="divide-y">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <a.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDate(a.date)}
                  </p>
                </div>
                <span className="text-sm font-medium">{a.meta}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <p className="font-medium">Contact</p>
        <ContactLine icon={<Mail className="size-4" />}>
          {customer.email}
        </ContactLine>
        <ContactLine icon={<Phone className="size-4" />}>
          {customer.phone}
        </ContactLine>
        {customer.company && (
          <ContactLine icon={<Building2 className="size-4" />}>
            {customer.company}
          </ContactLine>
        )}
      </div>
    </div>
  );
}

function ContactLine({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}
