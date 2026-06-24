"use client";

import { CalendarCheck, MapPin, Users } from "lucide-react";
import { CardGridSkeleton, ListSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { useVenues } from "./use-venues";
import { VenueStatusBadge } from "./venue-status-badge";

export function VenuesOverview({
  layout = "grid",
}: {
  layout?: "grid" | "list";
}) {
  const { data: venues, isLoading, isError } = useVenues();

  if (isError) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          We couldn&apos;t load your venues. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !venues) {
    return layout === "list" ? (
      <ListSkeleton rows={4} />
    ) : (
      <CardGridSkeleton count={3} />
    );
  }

  if (layout === "list") {
    return (
      <Card>
        <CardContent className="divide-y p-0">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
                {getInitials(venue.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{venue.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {venue.city}
                </p>
              </div>
              <VenueStatusBadge status={venue.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
      {venues.map((venue) => (
        <Card
          key={venue.id}
          className="group transition-shadow hover:shadow-lg hover:shadow-primary/5"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-chart-4 text-sm font-semibold text-primary-foreground shadow-sm">
                {getInitials(venue.name)}
              </div>
              <VenueStatusBadge status={venue.status} />
            </div>
            <div className="mt-3 space-y-1">
              <h3 className="font-semibold leading-tight">{venue.name}</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {venue.city}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-4" />
                {venue.capacity.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarCheck className="size-4" />
                {venue.bookingsThisMonth} this month
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(venue.pricePerDay)}
                <span className="text-xs font-normal text-muted-foreground">
                  /day
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
