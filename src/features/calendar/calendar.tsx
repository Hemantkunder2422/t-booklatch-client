"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import {
  STATUS_ORDER,
  STATUS_META,
  STATUS_PRIORITY,
  type CalendarEvent,
  type SlotStatus,
} from "./types";
import {
  WEEKDAYS,
  addMonths,
  dateKey,
  getMonthMatrix,
  isSameDay,
  monthLabel,
} from "./utils";

interface CalendarProps {
  events: CalendarEvent[];
  selected?: Date | null;
  onSelectDate?: (date: Date, key: string) => void;
  variant?: "full" | "mini";
  defaultMonth?: Date;
  /** Optional "from" price per day, shown on full-variant cells. */
  priceForDate?: (key: string) => number | undefined;
  className?: string;
}

export function Calendar({
  events,
  selected,
  onSelectDate,
  variant = "full",
  defaultMonth,
  priceForDate,
  className,
}: CalendarProps) {
  const [viewMonth, setViewMonth] = useState(
    () => defaultMonth ?? new Date(),
  );
  // Computed once so it's stable across renders (and SSR-safe enough).
  const [todayKey] = useState(() => dateKey(new Date()));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const weeks = useMemo(() => getMonthMatrix(viewMonth), [viewMonth]);
  const isMini = variant === "mini";

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <h3
          className={cn(
            "font-semibold tracking-tight",
            isMini ? "text-sm" : "text-base",
          )}
        >
          {monthLabel(viewMonth)}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className={isMini ? "size-7" : "size-8"}
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={isMini ? "size-7" : "size-8"}
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 border-b pb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {isMini ? day.charAt(0) : day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className={cn(
          "grid flex-1 grid-cols-7",
          isMini ? "gap-0.5 pt-1" : "auto-rows-fr",
        )}
      >
        {weeks.flat().map((cell) => {
          const dayEvents = eventsByDay.get(cell.key) ?? [];
          const isSelected = selected ? isSameDay(cell.date, selected) : false;
          const isToday = cell.key === todayKey;

          return (
            <DayCell
              key={cell.key}
              dateNumber={cell.date.getDate()}
              inCurrentMonth={cell.inCurrentMonth}
              isSelected={isSelected}
              isToday={isToday}
              events={dayEvents}
              variant={variant}
              price={priceForDate?.(cell.key)}
              onClick={() => onSelectDate?.(cell.date, cell.key)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  dateNumber,
  inCurrentMonth,
  isSelected,
  isToday,
  events,
  variant,
  price,
  onClick,
}: {
  dateNumber: number;
  inCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  variant: "full" | "mini";
  price?: number;
  onClick: () => void;
}) {
  const isMini = variant === "mini";
  const statuses = uniqueStatuses(events);

  if (isMini) {
    const dominant = STATUS_PRIORITY.find((s) => statuses.includes(s));
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-all",
          inCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
          isSelected
            ? "bg-primary text-primary-foreground shadow-sm"
            : dominant
              ? cn(STATUS_META[dominant].soft, "hover:brightness-95")
              : "hover:bg-muted",
          isToday && !isSelected && "ring-1 ring-primary/50",
        )}
      >
        <span className="leading-none">{dateNumber}</span>
        {statuses.length > 0 && (
          <span className="flex gap-0.5">
            {statuses.slice(0, 3).map((status) => (
              <span
                key={status}
                className={cn(
                  "size-1.5 rounded-full",
                  isSelected ? "bg-primary-foreground" : STATUS_META[status].dot,
                )}
              />
            ))}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-24 flex-col gap-1 border-t border-l p-1.5 text-left transition-colors first:border-l-0 nth-[7n+1]:border-l-0",
        inCurrentMonth ? "bg-background" : "bg-muted/30",
        "hover:bg-muted/50",
        isSelected && "ring-2 ring-primary ring-inset",
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs",
          !inCurrentMonth && "text-muted-foreground/40",
          isToday && "bg-primary font-semibold text-primary-foreground",
        )}
      >
        {dateNumber}
      </span>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        {events.slice(0, 2).map((event) => (
          <span
            key={event.id}
            className={cn(
              "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-medium",
              STATUS_META[event.status].soft,
              STATUS_META[event.status].text,
            )}
          >
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                STATUS_META[event.status].dot,
              )}
            />
            <span className="truncate">{event.title}</span>
          </span>
        ))}
        {events.length > 2 && (
          <span className="px-1 text-[11px] text-muted-foreground">
            +{events.length - 2} more
          </span>
        )}
      </div>

      {price != null && inCurrentMonth && (
        <span className="mt-auto pl-0.5 text-[10px] font-medium text-muted-foreground">
          from {formatCurrency(price)}
        </span>
      )}
    </button>
  );
}

function uniqueStatuses(events: CalendarEvent[]): SlotStatus[] {
  const present = new Set(events.map((e) => e.status));
  return STATUS_ORDER.filter((s) => present.has(s));
}
