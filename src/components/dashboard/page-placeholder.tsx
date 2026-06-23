import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {actionLabel && (
          <Button className="gap-1.5">
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        )}
      </div>

      {/* Empty-state illustration */}
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
        <div className="relative mb-6">
          {/* Concentric decorative rings */}
          <div className="absolute -inset-6 rounded-full border border-border/60" />
          <div className="absolute -inset-3 rounded-full border border-border" />
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-2xl" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-chart-4 text-primary-foreground shadow-xl shadow-primary/20">
            <Icon className="size-9" />
          </div>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel && (
          <Button className="mt-6 gap-1.5">
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
