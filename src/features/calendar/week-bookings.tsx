"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dateKey, monthLabel } from "./utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Accent = "teal" | "amber" | "indigo" | "pink";

const ACCENT: Record<Accent, string> = {
  teal: "border-chart-2 bg-chart-2/12 text-chart-2",
  amber: "border-chart-3 bg-chart-3/12 text-chart-3",
  indigo: "border-primary bg-primary/12 text-primary",
  pink: "border-chart-4 bg-chart-4/12 text-chart-4",
};

// day: 0 = Monday … 6 = Sunday
const WEEK_BOOKINGS: {
  day: number;
  title: string;
  space: string;
  accent: Accent;
}[] = [
  { day: 0, title: "Tasting", space: "Garden", accent: "teal" },
  { day: 1, title: "Corporate", space: "Terrace", accent: "teal" },
  { day: 2, title: "Viewing", space: "Grand Hall", accent: "amber" },
  { day: 2, title: "Setup", space: "Garden", accent: "teal" },
  { day: 4, title: "Gala", space: "Terrace", accent: "teal" },
  { day: 5, title: "Wedding", space: "Grand Hall", accent: "indigo" },
  { day: 5, title: "Reception", space: "Garden", accent: "pink" },
  { day: 6, title: "Brunch", space: "Terrace", accent: "indigo" },
];

export function WeekBookings() {
  // Monday of the current week (computed once, client-side).
  const [monday] = useState(() => {
    const d = new Date();
    const dow = d.getDay(); // 0 Sun … 6 Sat
    const diff = dow === 0 ? -6 : 1 - dow;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  });
  const [todayKey] = useState(() => dateKey(new Date()));

  const days = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i),
  );

  const spaceCount = new Set(WEEK_BOOKINGS.map((b) => b.space)).size;

  return (
    <Card className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {monthLabel(monday)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {spaceCount} spaces · {WEEK_BOOKINGS.length} bookings this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5 text-sm">
            <Link
              href="/calendars"
              className="rounded-md px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              Day
            </Link>
            <span className="rounded-md bg-primary/10 px-3 py-1 font-medium text-primary">
              Week
            </span>
            <Link
              href="/calendars"
              className="rounded-md px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              Month
            </Link>
          </div>
          <Button asChild className="gap-1.5">
            <Link href="/bookings">
              <Plus className="size-4" />
              New
            </Link>
          </Button>
        </div>
      </div>

      {/* Week grid (scrolls horizontally on small screens) */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[44rem]">
          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, i) => {
              const isToday = dateKey(date) === todayKey;
              return (
                <div key={i} className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    {WEEKDAYS[i]}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-flex size-7 items-center justify-center rounded-full text-sm",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((_, i) => (
              <div
                key={i}
                className="min-h-32 space-y-1.5 rounded-lg border bg-muted/20 p-1.5"
              >
                {WEEK_BOOKINGS.filter((b) => b.day === i).map((b, j) => (
                  <div
                    key={j}
                    className={cn(
                      "rounded-md border-l-2 px-2 py-1.5 text-[11px] leading-tight",
                      ACCENT[b.accent],
                    )}
                  >
                    <p className="font-semibold">{b.title} ·</p>
                    <p className="opacity-90">{b.space}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
