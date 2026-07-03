"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import type { BookingSlot } from "@/types/models";
import { Calendar } from "./calendar";
import { CalendarLegend } from "./calendar-legend";
import { DayDetails } from "./day-details";
import {
  applyPrice,
  clearDay,
  DEFAULT_PRICING,
  fromPrice,
  setDayPrices,
  type PricingState,
} from "./pricing";
import { buildSampleEvents } from "./sample-events";
import { DaySlotPricing, PricingSheet } from "./slot-pricing";
import { dateKey } from "./utils";

export function CalendarView() {
  // Anchor sample data + initial selection to "today" (client-side).
  const [{ events, initialDate }] = useState(() => {
    const now = new Date();
    return { events: buildSampleEvents(now), initialDate: now };
  });

  const [selected, setSelected] = useState<Date | null>(initialDate);
  const [pricing, setPricing] = useState<PricingState>(DEFAULT_PRICING);

  const selectedKey = selected ? dateKey(selected) : null;
  const dayEvents = useMemo(
    () => (selectedKey ? events.filter((e) => e.date === selectedKey) : []),
    [events, selectedKey],
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Calendars</h1>
          <p className="text-muted-foreground">
            Bookings, availability, and slot pricing across your spaces.
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

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="flex flex-col p-4 sm:p-5">
          <Calendar
            events={events}
            selected={selected}
            onSelectDate={(date) => setSelected(date)}
            variant="full"
            defaultMonth={initialDate}
            priceForDate={(key) => fromPrice(pricing, key)}
            className="flex-1"
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

          {selected && (
            <DaySlotPricing
              key={selectedKey}
              date={selected}
              pricing={pricing}
              onSave={(key, prices: Record<BookingSlot, number>) =>
                setPricing((p) => setDayPrices(p, key, prices))
              }
              onReset={(key) => setPricing((p) => clearDay(p, key))}
            />
          )}
        </div>
      </div>
    </>
  );
}
