"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  balanceOf,
  isOutstanding,
  paidOf,
  payStatus,
  useBookingsStore,
} from "@/features/bookings/store";

type Filter = "all" | "overdue" | "advance" | "unpaid";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "advance", label: "Advance paid" },
  { value: "unpaid", label: "Unpaid" },
];

export function PaymentsView() {
  const router = useRouter();
  const bookings = useBookingsStore.use.bookings();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  // Compute "today" once (lazy) to keep render pure.
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const outstandingList = useMemo(
    () =>
      bookings
        .filter(isOutstanding)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [bookings],
  );

  const outstandingTotal = useMemo(
    () => outstandingList.reduce((s, b) => s + balanceOf(b), 0),
    [outstandingList],
  );
  const overdueCount = useMemo(
    () => outstandingList.filter((b) => b.dueDate < today).length,
    [outstandingList, today],
  );
  const collectedTotal = useMemo(
    () => bookings.reduce((s, b) => s + paidOf(b), 0),
    [bookings],
  );

  const filtered = useMemo(
    () =>
      outstandingList.filter((b) => {
        const q = query.toLowerCase();
        const matchesQuery =
          b.customerName.toLowerCase().includes(q) ||
          b.eventName.toLowerCase().includes(q) ||
          b.venueSpaceName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q);
        if (!matchesQuery) return false;
        if (filter === "overdue") return b.dueDate < today;
        if (filter === "advance") return paidOf(b) > 0;
        if (filter === "unpaid") return paidOf(b) === 0;
        return true;
      }),
    [outstandingList, query, filter, today],
  );

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Bookings awaiting payment. Collecting the full balance confirms the
          booking and generates the invoice.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding" value={formatCurrency(outstandingTotal)} />
        <StatCard
          label="Overdue"
          value={String(overdueCount)}
          className="text-destructive"
        />
        <StatCard
          label="Collected"
          value={formatCurrency(collectedTotal)}
          className="text-success"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === f.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Worklist */}
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Booking</TableHead>
              <TableHead className="hidden lg:table-cell">Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No pending payments. You&apos;re all caught up. 🎉
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => {
                const isOverdue = b.dueDate < today;
                const status = payStatus(b);
                return (
                  <TableRow
                    key={b.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/payments/${b.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-muted text-xs font-medium">
                            {getInitials(b.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {b.customerName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {b.eventName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      {b.venueSpaceName}
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
                        {formatDate(b.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-medium", status.className)}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatCurrency(balanceOf(b))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {formatCurrency(b.amount)}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => router.push(`/payments/${b.id}`)}
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
