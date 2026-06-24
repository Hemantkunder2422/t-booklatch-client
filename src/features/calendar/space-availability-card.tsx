"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { CalendarLegend } from "./calendar-legend";
import { SAMPLE_SPACES, buildSampleEvents } from "./sample-events";
import { STATUS_META } from "./types";
import { dateKey } from "./utils";

export function SpaceAvailabilityCard() {
  const [{ allEvents, initialDate }] = useState(() => {
    const now = new Date();
    return { allEvents: buildSampleEvents(now), initialDate: now };
  });
  const [selected, setSelected] = useState<Date | null>(initialDate);
  const [space, setSpace] = useState("all");

  const events = useMemo(
    () =>
      space === "all"
        ? allEvents
        : allEvents.filter((e) => e.space === space),
    [allEvents, space],
  );

  const selectedKey = selected ? dateKey(selected) : null;
  const dayEvents = useMemo(
    () => (selectedKey ? events.filter((e) => e.date === selectedKey) : []),
    [events, selectedKey],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Space availability</CardTitle>
        <CardDescription>Quick view of your booking calendar.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/calendars">
              Open
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Space selector */}
        <Select value={space} onValueChange={setSpace}>
          <SelectTrigger className="w-full" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All spaces</SelectItem>
            {SAMPLE_SPACES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Calendar
          events={events}
          selected={selected}
          onSelectDate={(date) => setSelected(date)}
          variant="mini"
          defaultMonth={initialDate}
        />

        <CalendarLegend className="justify-between gap-y-1 border-t pt-3" />

        {/* Selected-day quick summary */}
        <div className="space-y-1.5 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            {selected?.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events — open day.</p>
          ) : (
            dayEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    STATUS_META[event.status].dot,
                  )}
                />
                <span className="truncate">{event.title}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
