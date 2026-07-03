"use client";

import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  CreditCard,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AppNotification {
  id: string;
  icon: LucideIcon;
  iconClass: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL: AppNotification[] = [
  {
    id: "n1",
    icon: CalendarCheck,
    iconClass: "bg-primary/10 text-primary",
    title: "New booking confirmed",
    description: "Olivia Bennett booked Grand Atrium Hall.",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    icon: Inbox,
    iconClass: "bg-chart-3/15 text-chart-3",
    title: "New enquiry received",
    description: "Hannah Brooks asked about a September wedding.",
    time: "1h ago",
    read: false,
  },
  {
    id: "n3",
    icon: CreditCard,
    iconClass: "bg-success/15 text-success",
    title: "Payment received",
    description: "₹2,600 deposit from Priya Nair.",
    time: "3h ago",
    read: false,
  },
  {
    id: "n4",
    icon: CalendarCheck,
    iconClass: "bg-muted text-muted-foreground",
    title: "Booking rescheduled",
    description: "Marcus Reid moved to Jun 30.",
    time: "Yesterday",
    read: true,
  },
];

export function NotificationsMenu() {
  const [items, setItems] = useState<AppNotification[]>(INITIAL);
  const unread = items.filter((n) => !n.read).length;

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function markOne(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-[1.1rem]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {unread} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={markAll}
            disabled={unread === 0}
          >
            <CheckCheck className="size-3.5" />
            Mark all
          </Button>
        </div>
        <Separator />

        <ScrollArea className="h-80">
          <div className="p-1">
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markOne(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/60",
                  !n.read && "bg-primary/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    n.iconClass,
                  )}
                >
                  <n.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight font-medium">{n.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {n.description}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {n.time}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
