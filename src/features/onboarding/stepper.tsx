import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepMeta {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function Stepper({
  steps,
  current,
}: {
  steps: StepMeta[];
  current: number;
}) {
  return (
    <div className="space-y-5">
      {/* Segmented progress header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-primary-foreground/70">
          <span>Setup progress</span>
          <span>
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((step, i) => (
            <span
              key={step.title}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                i <= current ? "bg-primary-foreground" : "bg-white/20",
              )}
            />
          ))}
        </div>
      </div>

      {/* Step cards */}
      <ol className="space-y-2">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isActive = index === current;
          const Icon = step.icon;

          return (
            <li key={step.title}>
              <div
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl border p-3 transition-all duration-300",
                  isActive &&
                    "border-white/25 bg-white/12 shadow-lg shadow-black/10",
                  isComplete && "border-transparent bg-white/4",
                  !isActive && !isComplete && "border-transparent",
                )}
              >
                {/* Icon tile */}
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                    isComplete && "bg-primary-foreground/90 text-primary",
                    isActive &&
                      "bg-primary-foreground text-primary ring-4 ring-white/15",
                    !isComplete &&
                      !isActive &&
                      "bg-white/10 text-primary-foreground/55",
                  )}
                >
                  {isComplete ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>

                {/* Labels */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "flex items-center gap-2 text-sm font-semibold transition-colors",
                      isActive || isComplete
                        ? "text-primary-foreground"
                        : "text-primary-foreground/55",
                    )}
                  >
                    {step.title}
                    {isActive && (
                      <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        Now
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "truncate text-xs transition-colors",
                      isActive
                        ? "text-primary-foreground/75"
                        : isComplete
                          ? "text-primary-foreground/55"
                          : "text-primary-foreground/40",
                    )}
                  >
                    {step.description}
                  </p>
                </div>

                {isComplete && (
                  <Check className="size-4 shrink-0 text-primary-foreground/70" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
