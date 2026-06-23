import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  customer: string;
  space: string;
  date: string;
  amount: number;
  status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  {
    id: "BK-2041",
    customer: "Olivia Bennett",
    space: "Grand Atrium Hall",
    date: "2026-06-28",
    amount: 4200,
    status: "confirmed",
  },
  {
    id: "BK-2040",
    customer: "Marcus Reid",
    space: "Riverside Pavilion",
    date: "2026-06-27",
    amount: 1900,
    status: "pending",
  },
  {
    id: "BK-2039",
    customer: "Priya Nair",
    space: "The Glasshouse Loft",
    date: "2026-06-25",
    amount: 2600,
    status: "confirmed",
  },
  {
    id: "BK-2038",
    customer: "Daniel Cho",
    space: "Skyline Rooftop",
    date: "2026-06-24",
    amount: 3100,
    status: "cancelled",
  },
  {
    id: "BK-2037",
    customer: "Sofia Alvarez",
    space: "Grand Atrium Hall",
    date: "2026-06-22",
    amount: 4200,
    status: "confirmed",
  },
];

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-success/15 text-success",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
  },
};

export function RecentBookings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent bookings</CardTitle>
        <CardDescription>Latest reservations across your venues.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/bookings">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y border-t">
          {BOOKINGS.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-muted text-xs font-medium">
                  {getInitials(booking.customer)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {booking.customer}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {booking.space}
                </p>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                {formatDate(booking.date)}
              </div>
              <div className="w-20 text-right text-sm font-medium">
                {formatCurrency(booking.amount)}
              </div>
              <span
                className={cn(
                  "hidden w-24 shrink-0 justify-center rounded-full px-2 py-0.5 text-center text-xs font-medium md:inline-flex",
                  STATUS[booking.status].className,
                )}
              >
                {STATUS[booking.status].label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
