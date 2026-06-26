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
import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/types/models";

interface RecentBooking {
  id: string;
  customerName: string;
  venueSpaceName: string;
  bookingDate: string;
  amount: number;
  bookingStatus: BookingStatus;
}

const BOOKINGS: RecentBooking[] = [
  {
    id: "BK-2041",
    customerName: "Olivia Bennett",
    venueSpaceName: "Grand Atrium Hall",
    bookingDate: "2026-06-28",
    amount: 4200,
    bookingStatus: "CONFIRMED",
  },
  {
    id: "BK-2040",
    customerName: "Marcus Reid",
    venueSpaceName: "Riverside Pavilion",
    bookingDate: "2026-06-27",
    amount: 1900,
    bookingStatus: "PENDING",
  },
  {
    id: "BK-2039",
    customerName: "Priya Nair",
    venueSpaceName: "The Glasshouse Loft",
    bookingDate: "2026-06-25",
    amount: 2600,
    bookingStatus: "CONFIRMED",
  },
  {
    id: "BK-2038",
    customerName: "Daniel Cho",
    venueSpaceName: "Skyline Rooftop",
    bookingDate: "2026-06-24",
    amount: 3100,
    bookingStatus: "CANCELLED",
  },
  {
    id: "BK-2037",
    customerName: "Sofia Alvarez",
    venueSpaceName: "Grand Atrium Hall",
    bookingDate: "2026-06-22",
    amount: 4200,
    bookingStatus: "COMPLETED",
  },
];

const STATUS_STYLE: Record<BookingStatus, string> = {
  CONFIRMED: "bg-success/15 text-success",
  PENDING: "bg-warning/15 text-warning-foreground dark:text-warning",
  CANCELLED: "bg-destructive/10 text-destructive",
  COMPLETED: "bg-primary/15 text-primary",
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
                  {getInitials(booking.customerName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {booking.customerName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {booking.venueSpaceName}
                </p>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                {formatDate(booking.bookingDate)}
              </div>
              <div className="w-20 text-right text-sm font-medium">
                {formatCurrency(booking.amount)}
              </div>
              <span
                className={cn(
                  "hidden w-24 shrink-0 justify-center rounded-full px-2 py-0.5 text-center text-xs font-medium md:inline-flex",
                  STATUS_STYLE[booking.bookingStatus],
                )}
              >
                {BOOKING_STATUS_LABELS[booking.bookingStatus]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
