import {
  CalendarCheck,
  ChevronRight,
  IndianRupee,
  type LucideIcon,
  MessageCircle,
  Send,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  name: string;
  line: string;
  icon: LucideIcon;
  /** The pivot stage — the one thing that blocks the calendar. */
  pivot?: boolean;
}

const STAGES: Stage[] = [
  { name: "Enquiry", line: "Someone asks", icon: MessageCircle },
  { name: "Quote", line: "You price it", icon: Send },
  { name: "Booking", line: "The date is held", icon: CalendarCheck, pivot: true },
  { name: "Invoice", line: "You bill it", icon: IndianRupee },
  { name: "Payment", line: "You get paid", icon: Wallet },
];

/**
 * The BookLatch flow, taught once: Enquiry → Quote → Booking → Invoice →
 * Payment, all happening inside a Space (within a Venue), for a Customer.
 * Horizontal on desktop, stacked on mobile.
 */
export function MentalModel() {
  return (
    <div className="rounded-xl border bg-surface-1 p-5 sm:p-6">
      {/* Context: where it all happens */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="rounded-full bg-accent px-2.5 py-1 text-accent-foreground">
          Venue
        </span>
        <ChevronRight className="size-3.5 text-ink-tertiary" aria-hidden="true" />
        <span className="rounded-full bg-accent px-2.5 py-1 text-accent-foreground">
          Space
        </span>
        <span className="text-ink-tertiary">— for a</span>
        <span className="rounded-full bg-accent px-2.5 py-1 text-accent-foreground">
          Customer
        </span>
      </div>

      {/* The pipeline */}
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <li
              key={stage.name}
              className="flex items-center gap-2 md:flex-1 md:flex-col md:items-stretch md:gap-0"
            >
              <div
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg border p-3 md:flex-col md:items-start md:gap-1.5",
                  stage.pivot
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    stage.pivot
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {stage.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{stage.line}</p>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <ChevronRight
                  aria-hidden="true"
                  className="mx-auto size-4 shrink-0 rotate-90 text-ink-tertiary md:my-2 md:rotate-0"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Two rules worth internalizing */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-dashed bg-card px-3 py-2 text-xs leading-5 text-ink-muted">
          <span className="font-semibold text-foreground">Packages</span> plug
          into quotes &amp; bookings so you don&apos;t retype line items.
        </p>
        <p className="rounded-lg border border-dashed bg-card px-3 py-2 text-xs leading-5 text-ink-muted">
          <span className="font-semibold text-foreground">
            Only a booking blocks the calendar
          </span>{" "}
          — enquiries and quotes never do.
        </p>
      </div>
    </div>
  );
}
