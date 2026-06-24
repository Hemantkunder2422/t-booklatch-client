"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Printer, Search, Send, Trash2 } from "lucide-react";
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

type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  customer: string;
  space: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  taxRate: number;
  status: InvoiceStatus;
  notes?: string;
}

const SPACES = [
  "Grand Atrium Hall",
  "Riverside Pavilion",
  "The Glasshouse Loft",
  "Skyline Rooftop",
];

const STATUS_META: Record<InvoiceStatus, { label: string; className: string }> =
  {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    pending: {
      label: "Pending",
      className: "bg-warning/15 text-warning-foreground dark:text-warning",
    },
    paid: { label: "Paid", className: "bg-success/15 text-success" },
    overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive" },
  };

const lineAmount = (item: { qty: number; unitPrice: number }) =>
  (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
const sumItems = (items: { qty: number; unitPrice: number }[]) =>
  items.reduce((s, i) => s + lineAmount(i), 0);
const invoiceTotal = (inv: Invoice) =>
  sumItems(inv.items) * (1 + inv.taxRate / 100);

const INITIAL: Invoice[] = [
  {
    id: "INV-1043",
    customer: "Olivia Bennett",
    space: "Grand Atrium Hall",
    issueDate: "2026-06-10",
    dueDate: "2026-06-24",
    items: [
      { description: "Venue rental — full day", qty: 1, unitPrice: 4200 },
      { description: "Plated dinner (per guest)", qty: 180, unitPrice: 65 },
    ],
    taxRate: 8,
    status: "paid",
  },
  {
    id: "INV-1042",
    customer: "Marcus Reid",
    space: "Riverside Pavilion",
    issueDate: "2026-06-14",
    dueDate: "2026-06-28",
    items: [{ description: "Conference package", qty: 1, unitPrice: 1900 }],
    taxRate: 8,
    status: "pending",
  },
  {
    id: "INV-1041",
    customer: "Daniel Cho",
    space: "Skyline Rooftop",
    issueDate: "2026-05-30",
    dueDate: "2026-06-13",
    items: [{ description: "Rooftop evening hire", qty: 1, unitPrice: 3100 }],
    taxRate: 8,
    status: "overdue",
  },
];

const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Required"),
  qty: z.string().trim().min(1, "Qty"),
  unitPrice: z.string().trim().min(1, "Price"),
});

const invoiceSchema = z.object({
  customer: z.string().trim().min(2, "Customer is required"),
  space: z.string().min(1, "Select a space"),
  issueDate: z.string().min(1, "Pick a date"),
  dueDate: z.string().min(1, "Pick a date"),
  taxRate: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "pending", "paid", "overdue"]),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(lineItemSchema).min(1, "Add at least one line item"),
});
type InvoiceValues = z.infer<typeof invoiceSchema>;

let invoiceCounter = 1044;

export function InvoicesView() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<Invoice | null>(null);

  const stats = useMemo(() => {
    let outstanding = 0;
    let paid = 0;
    let overdue = 0;
    for (const inv of invoices) {
      const total = invoiceTotal(inv);
      if (inv.status === "paid") paid += total;
      if (inv.status === "pending" || inv.status === "overdue")
        outstanding += total;
      if (inv.status === "overdue") overdue += 1;
    }
    return { outstanding, paid, overdue };
  }, [invoices]);

  const filtered = useMemo(
    () =>
      invoices.filter(
        (inv) =>
          inv.customer.toLowerCase().includes(query.toLowerCase()) ||
          inv.id.toLowerCase().includes(query.toLowerCase()) ||
          inv.space.toLowerCase().includes(query.toLowerCase()),
      ),
    [invoices, query],
  );

  function handleCreate(values: InvoiceValues) {
    const invoice: Invoice = {
      id: `INV-${invoiceCounter++}`,
      customer: values.customer,
      space: values.space,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      taxRate: Number(values.taxRate) || 0,
      status: values.status,
      notes: values.notes || undefined,
      items: values.items.map((i) => ({
        description: i.description,
        qty: Number(i.qty) || 0,
        unitPrice: Number(i.unitPrice) || 0,
      })),
    };
    setInvoices((prev) => [invoice, ...prev]);
    setCreateOpen(false);
    toast.success("Invoice generated", { description: invoice.id });
  }

  function markPaid(id: string) {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv)),
    );
    setActive((curr) => (curr?.id === id ? { ...curr, status: "paid" } : curr));
    toast.success("Invoice marked as paid");
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Generate and track invoices for your bookings.
          </p>
        </div>
        <GenerateInvoiceDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
        />
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
        />
        <StatCard
          label="Paid"
          value={formatCurrency(stats.paid)}
          className="text-success"
        />
        <StatCard
          label="Overdue"
          value={String(stats.overdue)}
          className="text-destructive"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoices…"
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
              <TableHead>Invoice</TableHead>
              <TableHead className="hidden md:table-cell">Space</TableHead>
              <TableHead className="hidden lg:table-cell">Due</TableHead>
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
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => setActive(inv)}
                >
                  <TableCell>
                    <div className="font-medium">{inv.customer}</div>
                    <div className="text-xs text-muted-foreground">{inv.id}</div>
                  </TableCell>
                  <TableCell className="hidden text-sm md:table-cell">
                    {inv.space}
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoiceTotal(inv))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_META[inv.status].className,
                      )}
                    >
                      {STATUS_META[inv.status].label}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceDetailsDialog
        invoice={active}
        onOpenChange={(open) => !open && setActive(null)}
        onMarkPaid={markPaid}
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

const EMPTY_VALUES: InvoiceValues = {
  customer: "",
  space: "",
  issueDate: "",
  dueDate: "",
  taxRate: "8",
  status: "draft",
  notes: "",
  items: [{ description: "", qty: "1", unitPrice: "" }],
};

function GenerateInvoiceDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InvoiceValues) => void;
}) {
  const form = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: EMPTY_VALUES,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems =
    useWatch({ control: form.control, name: "items" }) ?? [];
  const watchedTax = useWatch({ control: form.control, name: "taxRate" }) ?? "";

  const subtotal = watchedItems.reduce(
    (s, i) => s + (Number(i?.qty) || 0) * (Number(i?.unitPrice) || 0),
    0,
  );
  const tax = subtotal * ((Number(watchedTax) || 0) / 100);
  const total = subtotal + tax;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset(EMPTY_VALUES);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Generate invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate invoice</DialogTitle>
          <DialogDescription>
            Build line items and BookLatch will total it up.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="invoice-form"
          >
            <div className="grid gap-4 sm:grid-cols-2">
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
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            {/* Totals */}
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Tax</span>
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <Input
                        {...field}
                        inputMode="numeric"
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^0-9.]/g, ""))
                        }
                        className="h-7 w-14"
                      />
                    )}
                  />
                  <span>%</span>
                </div>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={1} placeholder="Optional…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="invoice-form" className="gap-1.5">
            <Send className="size-4" />
            Generate invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDetailsDialog({
  invoice,
  onOpenChange,
  onMarkPaid,
}: {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onMarkPaid: (id: string) => void;
}) {
  const subtotal = invoice ? sumItems(invoice.items) : 0;
  const tax = invoice ? subtotal * (invoice.taxRate / 100) : 0;

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {invoice && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle>{invoice.id}</DialogTitle>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_META[invoice.status].className,
                  )}
                >
                  {STATUS_META[invoice.status].label}
                </span>
              </div>
              <DialogDescription>
                {invoice.space} · due {formatDate(invoice.dueDate)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bill to</p>
                  <p className="font-medium">{invoice.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Issued</p>
                  <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                </div>
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
                    {invoice.items.map((item, i) => (
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
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal + tax)}</span>
                </div>
              </div>

              {invoice.notes && (
                <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  {invoice.notes}
                </p>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => toast.info("Download isn't wired up in this demo.")}
              >
                <Printer className="size-4" />
                Download PDF
              </Button>
              {invoice.status !== "paid" && (
                <Button
                  className="sm:flex-1"
                  onClick={() => onMarkPaid(invoice.id)}
                >
                  Mark as paid
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
