"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKING_SPACES, useBookingsStore } from "@/features/bookings/store";
import type { BookingSlot } from "@/types/models";
import { bookingsToEvents } from "./booking-events";
import { CalendarLegend } from "./calendar-legend";
import { DayDetails } from "./day-details";
import {
  applyPrice,
  clearDay,
  DEFAULT_PRICING,
  parseInputMonth,
  setDayPrices,
  type PricingState,
} from "./pricing";
import { buildSampleEvents } from "./sample-events";
import { DaySlotPricing, PricingSheet } from "./slot-pricing";
import { TimeGrid } from "./time-grid";
import { addDays, dateKey, rangeLabel, startOfWeek } from "./utils";
import type { CalendarEvent } from "./types";

type View = "week" | "day";

export function CalendarView() {
  const bookings = useBookingsStore.use.bookings();

  const [{ ambiance, today }] = useState(() => {
    const now = new Date();
    return {
      ambiance: buildSampleEvents(now).filter((e) => !e.booking),
      today: now,
    };
  });

  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState<Date>(today);
  const [selected, setSelected] = useState<Date>(today);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [space, setSpace] = useState("all");
  const [pricing, setPricing] = useState<PricingState>(DEFAULT_PRICING);

  const allEvents = useMemo(
    () => [...ambiance, ...bookingsToEvents(bookings)],
    [ambiance, bookings],
  );
  const events = useMemo(
    () => (space === "all" ? allEvents : allEvents.filter((e) => e.space === space)),
    [allEvents, space],
  );

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  const selectedKey = dateKey(selected);
  const dayEvents = useMemo(
    () => events.filter((e) => e.date === selectedKey),
    [events, selectedKey],
  );

  const monthValue = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}`;

  function step(dir: number) {
    setAnchor((a) => addDays(a, dir * (view === "week" ? 7 : 1)));
  }
  function onPickEvent(event: CalendarEvent) {
    setSelectedEventId(event.id);
    const [y, m, d] = event.date.split("-").map(Number);
    setSelected(new Date(y, m - 1, d));
  }
  function onPickSlot(date: Date) {
    setSelected(date);
    setSelectedEventId(null);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Calendars</h1>
          <p className="text-muted-foreground">
            Continuous availability and bookings across your spaces.
          </p>
        </div>
        <PricingSheet
          pricing={pricing}
          onApply={(keys, slot, price) =>
            setPricing((p) => applyPrice(p, keys, slot, price))
          }
          onSetBase={(base) => setPricing((p) => ({ ...p, base }))}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAnchor(today)}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => step(-1)}
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => step(1)}
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <span className="min-w-40 text-sm font-medium">
            {rangeLabel(days)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Venue filter */}
          <Select value={space} onValueChange={setSpace}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All spaces</SelectItem>
              {BOOKING_SPACES.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month jump */}
          <Input
            type="month"
            value={monthValue}
            onChange={(e) => {
              const parsed = parseInputMonth(e.target.value);
              if (parsed) setAnchor(new Date(parsed.year, parsed.month, 1));
            }}
            className="h-8 w-40"
            aria-label="Jump to month"
          />

          {/* View toggle */}
          <div className="flex rounded-lg border p-0.5 text-sm">
            {(["day", "week"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cnView(view === v)}
              >
                {v === "day" ? "Day" : "Week"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="flex flex-col p-3 sm:p-4">
          <TimeGrid
            days={days}
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={onPickEvent}
            onSelectSlot={onPickSlot}
            className="max-h-[62vh]"
          />
          <CalendarLegend className="border-t pt-4" />
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <DayDetails
              date={selected}
              events={dayEvents}
              onAddSlot={() =>
                toast.info("Slot editor isn't wired up in this demo.")
              }
            />
          </Card>

          <DaySlotPricing
            key={selectedKey}
            date={selected}
            pricing={pricing}
            onSave={(key, prices: Record<BookingSlot, number>) =>
              setPricing((p) => setDayPrices(p, key, prices))
            }
            onReset={(key) => setPricing((p) => clearDay(p, key))}
          />
        </div>
      </div>
    </>
  );
}

function cnView(active: boolean): string {
  return active
    ? "rounded-md bg-primary/10 px-3 py-1 font-medium text-primary"
    : "rounded-md px-3 py-1 text-muted-foreground transition-colors hover:text-foreground";
}
