"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKING_SPACES, useBookingsStore } from "@/features/bookings/store";
import { cn } from "@/lib/utils";
import { bookingsToEvents } from "./booking-events";
import { CalendarLegend } from "./calendar-legend";
import { parseInputMonth } from "./pricing";
import { buildSampleEvents } from "./sample-events";
import { TimeGrid } from "./time-grid";
import type { CalendarEvent } from "./types";
import { addDays, dateKey, startOfWeek } from "./utils";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SpaceAvailabilityCard() {
  const router = useRouter();
  const bookings = useBookingsStore.use.bookings();

  const [{ ambiance, today }] = useState(() => {
    const now = new Date();
    return {
      ambiance: buildSampleEvents(now).filter((e) => !e.booking),
      today: now,
    };
  });

  const [selected, setSelected] = useState<Date>(today);
  const [space, setSpace] = useState("all");

  const events = useMemo(() => {
    const all = [...ambiance, ...bookingsToEvents(bookings)];
    return space === "all" ? all : all.filter((e) => e.space === space);
  }, [ambiance, bookings, space]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selected);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selected]);

  const todayKey = dateKey(today);
  const selectedKey = dateKey(selected);
  const monthValue = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}`;

  function onPickEvent(event: CalendarEvent) {
    if (event.id.startsWith("booking-")) {
      router.push(`/bookings/${event.id.replace("booking-", "")}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Space availability</CardTitle>
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
        <Select value={space} onValueChange={setSpace}>
          <SelectTrigger className="w-full" size="sm">
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

        {/* Month / year navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => setSelected((d) => addDays(d, -7))}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="month"
            value={monthValue}
            onChange={(e) => {
              const parsed = parseInputMonth(e.target.value);
              if (parsed) setSelected(new Date(parsed.year, parsed.month, 1));
            }}
            className="h-7 flex-1 text-xs"
            aria-label="Select month and year"
          />
          <Button
            variant="outline"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => setSelected((d) => addDays(d, 7))}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Week day strip */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const key = dateKey(day);
            const isSelected = key === selectedKey;
            const isToday = key === todayKey;
            const count = events.filter((e) => e.date === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(day)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    isSelected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {WEEKDAY_SHORT[day.getDay()].charAt(0)}
                </span>
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full font-medium",
                    !isSelected && isToday && "ring-1 ring-primary/50",
                  )}
                >
                  {day.getDate()}
                </span>
                <span
                  className={cn(
                    "size-1 rounded-full",
                    count > 0
                      ? isSelected
                        ? "bg-primary-foreground"
                        : "bg-primary"
                      : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Continuous day timeline */}
        <div className="rounded-xl border">
          <TimeGrid
            days={[selected]}
            events={events}
            dayStart={8}
            dayEnd={23}
            hourHeight={34}
            showHeader={false}
            compact
            onSelectEvent={onPickEvent}
            className="max-h-64"
          />
        </div>

        <CalendarLegend className="justify-between gap-y-1 border-t pt-3" />
      </CardContent>
    </Card>
  );
}
