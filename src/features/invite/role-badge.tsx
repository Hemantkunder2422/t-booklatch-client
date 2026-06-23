import { cn } from "@/lib/utils";
import type { WorkspaceRole } from "./types";

const ROLE_STYLES: Record<WorkspaceRole, string> = {
  Owner: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  Admin: "bg-primary/15 text-primary border-primary/25",
  Manager: "bg-accent text-accent-foreground border-primary/15",
  Coordinator: "bg-success/15 text-success border-success/25",
  Viewer: "bg-muted text-muted-foreground border-border",
};

export function RoleBadge({
  role,
  className,
}: {
  role: WorkspaceRole;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        ROLE_STYLES[role],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {role}
    </span>
  );
}
