import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DEFAULT_SCENARIO_ICON, SCENARIO_ICON } from "./icons";
import type { Scenario } from "./types";

/** A scenario tile used on the landing and role pages. */
export function ScenarioCard({
  scenario,
  index,
  className,
}: {
  scenario: Scenario;
  /** Optional ordinal, shown when the card is a step in a role path. */
  index?: number;
  className?: string;
}) {
  const Icon = SCENARIO_ICON[scenario.slug] ?? DEFAULT_SCENARIO_ICON;
  return (
    <Link
      href={`/docs/scenarios/${scenario.slug}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-hairline-strong hover:bg-accent/40",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4.5" />
        </span>
        {typeof index === "number" && (
          <span className="ml-auto text-xs font-medium text-ink-tertiary">
            Step {index}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold tracking-tight text-foreground">
          {scenario.title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          {scenario.tagline}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs text-ink-tertiary">{scenario.time} read</span>
        <ArrowRight className="size-4 text-ink-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}
