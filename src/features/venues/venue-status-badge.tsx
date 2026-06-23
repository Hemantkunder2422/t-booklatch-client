import { cn } from "@/lib/utils";
import type { VenueStatus } from "./types";

const STATUS_STYLES: Record<VenueStatus, { label: string; className: string }> =
  {
    active: {
      label: "Active",
      className:
        "bg-success/15 text-success border-success/20 dark:bg-success/20",
    },
    maintenance: {
      label: "Maintenance",
      className:
        "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/20 dark:text-warning",
    },
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

export function VenueStatusBadge({ status }: { status: VenueStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
