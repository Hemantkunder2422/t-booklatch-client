import { cn } from "@/lib/utils";
import { STATUS_META, STATUS_ORDER } from "./types";

export function CalendarLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {STATUS_ORDER.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", STATUS_META[status].dot)} />
          <span className="text-xs text-muted-foreground">
            {STATUS_META[status].label}
          </span>
        </div>
      ))}
    </div>
  );
}
