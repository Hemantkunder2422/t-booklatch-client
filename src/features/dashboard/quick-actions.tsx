import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  DoorOpen,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACTIONS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconClass: string;
}[] = [
  {
    title: "Create booking",
    description: "Reserve a space",
    href: "/bookings",
    icon: CalendarPlus,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    title: "Add space",
    description: "List a new area",
    href: "/spaces",
    icon: DoorOpen,
    iconClass: "bg-chart-2/15 text-chart-2",
  },
  {
    title: "Add contact",
    description: "Save a partner",
    href: "/contacts",
    icon: UserPlus,
    iconClass: "bg-chart-3/15 text-chart-3",
  },
  {
    title: "View calendar",
    description: "See availability",
    href: "/calendars",
    icon: CalendarDays,
    iconClass: "bg-chart-4/15 text-chart-4",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map(({ title, description, href, icon: Icon, iconClass }) => (
        <Card key={title} className="p-0">
          <Link
            href={href}
            className="group flex items-center gap-3.5 rounded-xl p-4 transition-colors hover:bg-muted/50"
          >
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                iconClass,
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </Card>
      ))}
    </div>
  );
}
