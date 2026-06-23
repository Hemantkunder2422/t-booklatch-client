"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Mail, Phone, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type CustomerStatus = "vip" | "active" | "inactive";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  bookings: number;
  totalSpent: number;
  lastBooking: string;
  status: CustomerStatus;
}

const STATUS_META: Record<CustomerStatus, { label: string; className: string }> =
  {
    vip: { label: "VIP", className: "bg-chart-4/15 text-chart-4" },
    active: { label: "Active", className: "bg-success/15 text-success" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  };

const CUSTOMERS: Customer[] = [
  {
    id: "cu-1",
    name: "Olivia Bennett",
    email: "olivia.bennett@gmail.com",
    phone: "+14155550148",
    company: "Bennett & Co.",
    bookings: 8,
    totalSpent: 33600,
    lastBooking: "2026-06-28",
    status: "vip",
  },
  {
    id: "cu-2",
    name: "Marcus Reid",
    email: "marcus@northwind.io",
    phone: "+14155550172",
    company: "Northwind Inc.",
    bookings: 5,
    totalSpent: 12400,
    lastBooking: "2026-06-27",
    status: "active",
  },
  {
    id: "cu-3",
    name: "Priya Nair",
    email: "priya.nair@aurora.org",
    phone: "+14155550110",
    company: "Aurora Foundation",
    bookings: 3,
    totalSpent: 9800,
    lastBooking: "2026-06-25",
    status: "active",
  },
  {
    id: "cu-4",
    name: "Daniel Cho",
    email: "daniel.cho@brightlabs.io",
    phone: "+14155550191",
    company: "Bright Labs",
    bookings: 2,
    totalSpent: 6200,
    lastBooking: "2026-04-12",
    status: "inactive",
  },
  {
    id: "cu-5",
    name: "Sofia Alvarez",
    email: "sofia@alvarezevents.com",
    phone: "+14155550133",
    company: "Alvarez Events",
    bookings: 6,
    totalSpent: 21500,
    lastBooking: "2026-06-22",
    status: "vip",
  },
];

export function CustomersView() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Customer | null>(null);

  const filtered = useMemo(
    () =>
      CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase()) ||
          c.company.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Everyone who books with you, with spend and history.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Company</TableHead>
              <TableHead className="hidden text-center md:table-cell">
                Bookings
              </TableHead>
              <TableHead className="text-right">Total spent</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                Last booking
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => setActive(customer)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{customer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">
                    {customer.company}
                  </TableCell>
                  <TableCell className="hidden text-center text-sm md:table-cell">
                    {customer.bookings}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                    {formatDate(customer.lastBooking)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_META[customer.status].className,
                      )}
                    >
                      {STATUS_META[customer.status].label}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog
        customer={active}
        onOpenChange={(open) => !open && setActive(null)}
      />
    </>
  );
}

function CustomerDialog({
  customer,
  onOpenChange,
}: {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!customer} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {customer && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 font-semibold text-primary-foreground">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>{customer.name}</DialogTitle>
                  <DialogDescription>{customer.company}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Bookings" value={String(customer.bookings)} />
              <Stat
                label="Total spent"
                value={formatCurrency(customer.totalSpent)}
              />
            </div>

            <div className="space-y-2 text-sm">
              <Line icon={<Mail className="size-4" />}>{customer.email}</Line>
              <Line icon={<Phone className="size-4" />}>{customer.phone}</Line>
              <Line icon={<CalendarClock className="size-4" />}>
                Last booking {formatDate(customer.lastBooking)}
              </Line>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="sm:flex-1" asChild>
                <a href={`mailto:${customer.email}`}>
                  <Mail className="size-4" />
                  Email
                </a>
              </Button>
              <Button className="sm:flex-1" asChild>
                <a href={`tel:${customer.phone}`}>
                  <Phone className="size-4" />
                  Call
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Line({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}
