"use client";

import {
  CalendarClock,
  CalendarPlus,
  DoorOpen,
  StickyNote,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { BOOKING_SLOT_LABELS } from "@/types/models";
import { STATUS_META, type CalendarEvent } from "./types";

export function DayDetails({
  date,
  events,
  onAddSlot,
}: {
  date: Date | null;
  events: CalendarEvent[];
  onAddSlot?: () => void;
}) {
  if (!date) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Select a date to see its bookings and notes.
      </div>
    );
  }

  const heading = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {events.length} {events.length === 1 ? "entry" : "entries"}
          </p>
          <h3 className="text-base font-semibold tracking-tight">{heading}</h3>
        </div>
        <Button size="sm" variant="outline" onClick={onAddSlot} className="gap-1.5">
          <CalendarPlus className="size-4" />
          Add
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-success/15 text-success">
              <DoorOpen className="size-5" />
            </div>
            <p className="text-sm font-medium">This day is open</p>
            <p className="max-w-[15rem] text-xs text-muted-foreground">
              No bookings or holds yet. Click “Add” to mark availability or
              create a booking.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="space-y-3 rounded-xl border bg-card/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{event.title}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_META[event.status].soft,
                    STATUS_META[event.status].text,
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      STATUS_META[event.status].dot,
                    )}
                  />
                  {STATUS_META[event.status].label}
                </span>
              </div>

              {event.booking && (
                <div className="space-y-1.5 rounded-lg bg-muted/50 p-2.5 text-xs">
                  <DetailRow icon={<User className="size-3.5" />}>
                    {event.booking.customer}
                  </DetailRow>
                  <DetailRow icon={<DoorOpen className="size-3.5" />}>
                    {event.booking.space}
                  </DetailRow>
                  <DetailRow icon={<CalendarClock className="size-3.5" />}>
                    {BOOKING_SLOT_LABELS[event.booking.slot]}
                  </DetailRow>
                  {event.booking.amount != null && (
                    <p className="pt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(event.booking.amount)}
                    </p>
                  )}
                </div>
              )}

              {event.note && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <StickyNote className="mt-0.5 size-3.5 shrink-0" />
                  {event.note}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}
