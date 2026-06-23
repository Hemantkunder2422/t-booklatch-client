import {
  ArrowUpRight,
  Building2,
  CalendarRange,
  DollarSign,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpaceAvailabilityCard } from "@/features/calendar/space-availability-card";
import { QuickActions } from "@/features/dashboard/quick-actions";
import { RecentBookings } from "@/features/dashboard/recent-bookings";
import { VenuesOverview } from "@/features/venues/venues-overview";
import { formatCurrency } from "@/lib/utils";

const STATS = [
  {
    label: "Total venues",
    value: "12",
    delta: "+2 this quarter",
    icon: Building2,
  },
  {
    label: "Bookings (MTD)",
    value: "148",
    delta: "+18% vs last month",
    icon: CalendarRange,
  },
  {
    label: "Revenue (MTD)",
    value: formatCurrency(86400),
    delta: "+12% vs last month",
    icon: DollarSign,
  },
  {
    label: "Occupancy rate",
    value: "73%",
    delta: "+4 pts",
    icon: TrendingUp,
  },
];

export default function DashboardHome() {
  return (
    <>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your venues today.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/onboarding">
            <Plus className="size-4" />
            New venue
          </Link>
        </Button>
      </div>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Quick actions
        </h2>
        <QuickActions />
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, delta, icon: Icon }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </div>
              </div>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="flex items-center gap-1 text-xs font-medium text-success">
                <ArrowUpRight className="size-3.5" />
                {delta}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid: bookings + venues */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookings />
        </div>
        <div className="space-y-6">
          <SpaceAvailabilityCard />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Your venues
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/spaces">View all</Link>
              </Button>
            </div>
            <VenuesOverview layout="list" />
          </div>
        </div>
      </div>
    </>
  );
}
