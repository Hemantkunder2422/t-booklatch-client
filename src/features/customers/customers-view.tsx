"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { customerStats, useCustomersStore } from "./store";

const SOURCE_LABELS: Record<string, string> = {
  enquiry: "From enquiry",
  direct: "Direct booking",
  manual: "Added manually",
};

const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().trim().min(1, "Phone is required"),
  company: z.string().optional().or(z.literal("")),
});
type CustomerValues = z.infer<typeof customerSchema>;

export function CustomersView() {
  const router = useRouter();
  const customers = useCustomersStore((s) => s.customers);
  const addCustomer = useCustomersStore((s) => s.addCustomer);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"active" | "inactive" | "all">("active");
  const [open, setOpen] = useState(false);

  const counts = useMemo(
    () => ({
      active: customers.filter((c) => c.status === "active").length,
      inactive: customers.filter((c) => c.status === "inactive").length,
      all: customers.length,
    }),
    [customers],
  );

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const matchesTab = tab === "all" || c.status === tab;
        const q = query.toLowerCase();
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company?.toLowerCase().includes(q) ?? false);
        return matchesTab && matchesQuery;
      }),
    [customers, tab, query],
  );

  function handleCreate(values: CustomerValues) {
    const created = addCustomer({
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company || undefined,
      source: "manual",
      status: "active",
    });
    setOpen(false);
    toast.success("Customer added", { description: created.name });
    router.push(`/customers/${created.id}`);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Your customer relationships — bookings, payments, and more.
          </p>
        </div>
        <AddCustomerSheet open={open} onOpenChange={setOpen} onSubmit={handleCreate} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="active">Active · {counts.active}</TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive · {counts.inactive}
            </TabsTrigger>
            <TabsTrigger value="all">All · {counts.all}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead className="hidden text-center md:table-cell">
                Bookings
              </TableHead>
              <TableHead className="text-right">Total spent</TableHead>
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
                  No customers here yet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => {
                const stats = customerStats(customer);
                return (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/customers/${customer.id}`)}
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
                            {customer.company ?? customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {SOURCE_LABELS[customer.source]}
                    </TableCell>
                    <TableCell className="hidden text-center text-sm md:table-cell">
                      {stats.bookings}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(stats.totalSpent)}
                    </TableCell>
                    <TableCell>
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

function AddCustomerSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CustomerValues) => void;
}) {
  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", company: "" },
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
          Add customer
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
          <SheetDescription>
            For a customer who booked directly or off a call.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="customer-form"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="customer-form">
            Add customer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
