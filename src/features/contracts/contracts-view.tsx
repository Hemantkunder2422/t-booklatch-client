"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, FileSignature, Plus, Printer, Search, Send } from "lucide-react";
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  useCustomersStore,
  type ContractStatus,
} from "@/features/customers/store";

interface ContractRow {
  id: string;
  title: string;
  date: string;
  status: ContractStatus;
  eventName?: string;
  value?: number;
  customerId: string;
  customerName: string;
  company?: string;
}

const STATUS_META: Record<ContractStatus, { label: string; className: string }> =
  {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    sent: { label: "Sent", className: "bg-primary/15 text-primary" },
    signed: { label: "Signed", className: "bg-success/15 text-success" },
  };

const contractSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  title: z.string().trim().min(2, "Title is required"),
  eventName: z.string().optional().or(z.literal("")),
  value: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "sent", "signed"]),
});
type ContractValues = z.infer<typeof contractSchema>;

export function ContractsView() {
  const customers = useCustomersStore((s) => s.customers);
  const addContract = useCustomersStore((s) => s.addContract);
  const setContractStatus = useCustomersStore((s) => s.setContractStatus);

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<ContractRow | null>(null);

  const rows = useMemo<ContractRow[]>(
    () =>
      customers
        .flatMap((c) =>
          c.contracts.map((k) => ({
            ...k,
            customerId: c.id,
            customerName: c.name,
            company: c.company,
          })),
        )
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [customers],
  );

  const counts = useMemo(
    () => ({
      draft: rows.filter((r) => r.status === "draft").length,
      sent: rows.filter((r) => r.status === "sent").length,
      signed: rows.filter((r) => r.status === "signed").length,
    }),
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      }),
    [rows, query],
  );

  function handleCreate(values: ContractValues) {
    const created = addContract({
      customerId: values.customerId,
      title: values.title,
      eventName: values.eventName || undefined,
      value: values.value ? Number(values.value.replace(/[^0-9]/g, "")) : undefined,
      status: values.status,
    });
    setCreateOpen(false);
    toast.success("Contract created", { description: created.id });
  }

  function updateStatus(row: ContractRow, status: ContractStatus) {
    setContractStatus(row.customerId, row.id, status);
    setActive((curr) => (curr?.id === row.id ? { ...curr, status } : curr));
    toast.success(`Contract ${STATUS_META[status].label.toLowerCase()}`);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">
            Create and track rental agreements with your customers.
          </p>
        </div>
        <NewContractSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          customers={customers.map((c) => ({
            id: c.id,
            name: c.name,
            company: c.company,
          }))}
          onSubmit={handleCreate}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Draft" value={counts.draft} />
        <StatCard label="Sent" value={counts.sent} className="text-primary" />
        <StatCard label="Signed" value={counts.signed} className="text-success" />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contracts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Contract</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Value</TableHead>
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
                  No contracts yet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setActive(row)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileSignature className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{row.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm md:table-cell">
                    {row.customerName}
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.value != null ? formatCurrency(row.value) : "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_META[row.status].className,
                      )}
                    >
                      {STATUS_META[row.status].label}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContractPreviewDialog
        contract={active}
        onOpenChange={(open) => !open && setActive(null)}
        onSetStatus={updateStatus}
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
  value: number;
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

function NewContractSheet({
  open,
  onOpenChange,
  customers,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: { id: string; name: string; company?: string }[];
  onSubmit: (values: ContractValues) => void;
}) {
  const form = useForm<ContractValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      customerId: "",
      title: "",
      eventName: "",
      value: "",
      status: "draft",
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
          New contract
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create contract</SheetTitle>
          <SheetDescription>
            Draft a rental agreement for a customer.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="contract-form"
            >
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {c.company ? ` · ${c.company}` : ""}
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Wedding rental agreement"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Brooks Wedding" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value (optional)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="500000"
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
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="signed">Signed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="contract-form">
            Create contract
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ContractPreviewDialog({
  contract,
  onOpenChange,
  onSetStatus,
}: {
  contract: ContractRow | null;
  onOpenChange: (open: boolean) => void;
  onSetStatus: (row: ContractRow, status: ContractStatus) => void;
}) {
  return (
    <Dialog open={!!contract} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {contract && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle>{contract.title}</DialogTitle>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_META[contract.status].className,
                  )}
                >
                  {STATUS_META[contract.status].label}
                </span>
              </div>
              <DialogDescription>
                {contract.id} · {formatDate(contract.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 rounded-xl border p-4 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Between</p>
                  <p className="font-medium">BookLatch</p>
                  <p className="font-medium">and {contract.customerName}</p>
                  {contract.company && (
                    <p className="text-xs text-muted-foreground">
                      {contract.company}
                    </p>
                  )}
                </div>
                {contract.value != null && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Contract value
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(contract.value)}
                    </p>
                  </div>
                )}
              </div>

              {contract.eventName && (
                <p className="text-muted-foreground">
                  For:{" "}
                  <span className="font-medium text-foreground">
                    {contract.eventName}
                  </span>
                </p>
              )}

              <Separator />
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Rental of the agreed space for the booked date and slot.</li>
                <li>Payment terms: deposit on booking, balance before the event.</li>
                <li>Cancellation &amp; refund policy as per venue terms.</li>
                <li>Security deposit, liability, and house rules apply.</li>
              </ul>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <div className="h-8 border-b border-dashed" />
                  <p className="text-xs text-muted-foreground">BookLatch</p>
                </div>
                <div className="space-y-1">
                  <div className="h-8 border-b border-dashed" />
                  <p className="text-xs text-muted-foreground">
                    {contract.customerName}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="gap-1.5 sm:flex-1"
                onClick={() => toast.info("Download isn't wired up in this demo.")}
              >
                <Printer className="size-4" />
                Download
              </Button>
              {contract.status === "draft" && (
                <Button
                  className="gap-1.5 sm:flex-1"
                  onClick={() => onSetStatus(contract, "sent")}
                >
                  <Send className="size-4" />
                  Send for signing
                </Button>
              )}
              {contract.status === "sent" && (
                <Button
                  className="gap-1.5 sm:flex-1"
                  onClick={() => onSetStatus(contract, "signed")}
                >
                  <Check className="size-4" />
                  Mark signed
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
