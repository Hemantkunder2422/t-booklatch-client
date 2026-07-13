"use client";

import { useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { STATUS_META, type CalendarEvent } from "./types";
import { dateKey, formatTime, minutesOf } from "./utils";

interface TimeGridProps {
  /** Day columns to render — 1 for day view, 7 for week view. */
  days: Date[];
  events: CalendarEvent[];
  /** Visible window (hours). Defaults to 7:00–24:00. */
  dayStart?: number;
  dayEnd?: number;
  /** Pixel height of one hour row. */
  hourHeight?: number;
  selectedEventId?: string | null;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (date: Date, hour: number) => void;
  /** Hide the day-name header row (e.g. compact dashboard timeline). */
  showHeader?: boolean;
  /** Paint un-booked time as green "Available" ranges. */
  showAvailability?: boolean;
  compact?: boolean;
  className?: string;
}

interface Placement {
  event: CalendarEvent;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TimeGrid({
  days,
  events,
  dayStart = 7,
  dayEnd = 24,
  hourHeight = 44,
  selectedEventId,
  onSelectEvent,
  onSelectSlot,
  showHeader = true,
  showAvailability = true,
  compact = false,
  className,
}: TimeGridProps) {
  // Captured once so "now" is stable and render stays pure.
  const [now] = useState(() => new Date());
  const todayKey = dateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const hours = useMemo(
    () => Array.from({ length: dayEnd - dayStart }, (_, i) => dayStart + i),
    [dayStart, dayEnd],
  );
  const gridHeight = (dayEnd - dayStart) * hourHeight;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  return (
    <div className={cn("overflow-auto", className)}>
      <div style={{ minWidth: days.length > 1 ? "42rem" : undefined }}>
        {/* Header row */}
        {showHeader && (
          <div
            className="sticky top-0 z-20 grid border-b bg-background/95 backdrop-blur"
            style={{ gridTemplateColumns: `4rem repeat(${days.length}, 1fr)` }}
          >
            <div />
            {days.map((day) => {
              const isToday = dateKey(day) === todayKey;
              return (
                <div
                  key={day.toISOString()}
                  className="flex flex-col items-center gap-0.5 py-2"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {WEEKDAY_SHORT[day.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `4rem repeat(${days.length}, 1fr)` }}
        >
          {/* Time gutter */}
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                style={{ top: i * hourHeight }}
              >
                {i === 0 ? "" : formatTime(`${h}:00`)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const key = dateKey(day);
            const placements = layoutDay(
              eventsByDay.get(key) ?? [],
              dayStart,
              dayEnd,
              hourHeight,
            );
            const gaps = showAvailability
              ? freeGaps(eventsByDay.get(key) ?? [], dayStart, dayEnd)
              : [];
            const isToday = key === todayKey;
            const showNow =
              isToday && nowMinutes >= dayStart * 60 && nowMinutes <= dayEnd * 60;
            const nowTop = ((nowMinutes - dayStart * 60) / 60) * hourHeight;

            return (
              <div
                key={key}
                className="relative border-l"
                style={{ height: gridHeight }}
              >
                {/* Hour cells (clickable availability) */}
                {hours.map((h, i) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onSelectSlot?.(day, h)}
                    aria-label={`${key} ${formatTime(`${h}:00`)}`}
                    className="absolute inset-x-0 border-t border-border/60 transition-colors hover:bg-muted/40"
                    style={{ top: i * hourHeight, height: hourHeight }}
                  />
                ))}

                {/* Available (un-booked) ranges */}
                {gaps.map(([start, end]) => {
                  const top = ((start - dayStart * 60) / 60) * hourHeight;
                  const height = ((end - start) / 60) * hourHeight;
                  const meta = STATUS_META.AVAILABLE;
                  return (
                    <button
                      key={`gap-${start}`}
                      type="button"
                      onClick={() => onSelectSlot?.(day, Math.floor(start / 60))}
                      className={cn(
                        "absolute inset-x-0.5 z-[1] overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-left text-[11px] leading-tight transition-colors hover:brightness-95",
                        meta.border,
                        "bg-success/10",
                        meta.text,
                      )}
                      style={{ top, height }}
                    >
                      {height > 26 && (
                        <p className="font-medium opacity-90">Available</p>
                      )}
                      {height > 42 && (
                        <p className="opacity-70">
                          {formatTime(hhmm(start))} – {formatTime(hhmm(end))}
                        </p>
                      )}
                    </button>
                  );
                })}

                {/* Now indicator */}
                {showNow && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-10"
                    style={{ top: nowTop }}
                  >
                    <div className="relative">
                      <span className="absolute -left-1 -top-1 size-2 rounded-full bg-destructive" />
                      <div className="border-t border-destructive" />
                    </div>
                  </div>
                )}

                {/* Event blocks */}
                {placements.map(({ event, top, height, lane, lanes }) => {
                  const meta = STATUS_META[event.status];
                  const selected = event.id === selectedEventId;
                  const widthPct = 100 / lanes;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent?.(event);
                      }}
                      className={cn(
                        "absolute z-10 overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-left text-[11px] leading-tight transition-shadow",
                        meta.border,
                        meta.soft,
                        meta.text,
                        selected && "ring-2 ring-primary ring-offset-1",
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * widthPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                    >
                      <p className="truncate font-semibold">{event.title}</p>
                      {height > 30 && (
                        <p className="truncate opacity-80">
                          {formatTime(event.start)}
                          {!compact && event.space ? ` · ${event.space}` : ""}
                        </p>
                      )}
                      {height > 52 && event.booking?.amount != null && !compact && (
                        <p className="truncate font-medium opacity-90">
                          {formatCurrency(event.booking.amount)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Minutes-since-midnight → "HH:mm". */
function hhmm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Free time within [dayStart, dayEnd] — the window minus every event (booked,
 * hold, maintenance). Returns [startMin, endMin] pairs to paint as available.
 */
function freeGaps(
  dayEvents: CalendarEvent[],
  dayStart: number,
  dayEnd: number,
): [number, number][] {
  const windowStart = dayStart * 60;
  const windowEnd = dayEnd * 60;

  const intervals = dayEvents
    .map((e) => [
      Math.max(minutesOf(e.start), windowStart),
      Math.min(minutesOf(e.end), windowEnd),
    ])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  for (const [s, e] of intervals) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  const gaps: [number, number][] = [];
  let cursor = windowStart;
  for (const [s, e] of merged) {
    if (s > cursor) gaps.push([cursor, s]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < windowEnd) gaps.push([cursor, windowEnd]);
  return gaps;
}

/** Position + overlap-lane layout for one day's events. */
function layoutDay(
  dayEvents: CalendarEvent[],
  dayStart: number,
  dayEnd: number,
  hourHeight: number,
): Placement[] {
  const windowStart = dayStart * 60;
  const windowEnd = dayEnd * 60;
  const sorted = [...dayEvents].sort(
    (a, b) => minutesOf(a.start) - minutesOf(b.start) || minutesOf(a.end) - minutesOf(b.end),
  );

  const result: Placement[] = [];
  let cluster: CalendarEvent[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const laneEnds: number[] = [];
    const laneOf = new Map<string, number>();
    for (const ev of cluster) {
      const start = minutesOf(ev.start);
      let lane = laneEnds.findIndex((end) => start >= end);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(minutesOf(ev.end));
      } else {
        laneEnds[lane] = minutesOf(ev.end);
      }
      laneOf.set(ev.id, lane);
    }
    const lanes = laneEnds.length;
    for (const ev of cluster) {
      const start = Math.max(minutesOf(ev.start), windowStart);
      const end = Math.min(minutesOf(ev.end), windowEnd);
      const top = ((start - windowStart) / 60) * hourHeight;
      const height = Math.max(((end - start) / 60) * hourHeight, 20);
      result.push({ event: ev, top, height, lane: laneOf.get(ev.id) ?? 0, lanes });
    }
    cluster = [];
  };

  for (const ev of sorted) {
    const start = minutesOf(ev.start);
    if (cluster.length && start >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = cluster.length === 1 ? minutesOf(ev.end) : Math.max(clusterEnd, minutesOf(ev.end));
  }
  if (cluster.length) flush();

  return result;
}
