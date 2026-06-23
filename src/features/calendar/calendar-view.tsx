"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Calendar } from "./calendar";
import { CalendarLegend } from "./calendar-legend";
import { DayDetails } from "./day-details";
import { buildSampleEvents } from "./sample-events";
import { dateKey } from "./utils";

export function CalendarView() {
  // Anchor sample data + initial selection to "today" (client-side).
  const [{ events, initialDate }] = useState(() => {
    const now = new Date();
    return { events: buildSampleEvents(now), initialDate: now };
  });

  const [selected, setSelected] = useState<Date | null>(initialDate);

  const selectedKey = selected ? dateKey(selected) : null;
  const dayEvents = useMemo(
    () =>
      selectedKey ? events.filter((e) => e.date === selectedKey) : [],
    [events, selectedKey],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Card className="flex flex-col p-4 sm:p-5">
        <Calendar
          events={events}
          selected={selected}
          onSelectDate={(date) => setSelected(date)}
          variant="full"
          defaultMonth={initialDate}
          className="flex-1"
        />
        <CalendarLegend className="border-t pt-4" />
      </Card>

      <Card className="overflow-hidden p-0">
        <DayDetails
          date={selected}
          events={dayEvents}
          onAddSlot={() =>
            toast.info("Slot editor isn't wired up in this demo.")
          }
        />
      </Card>
    </div>
  );
}
