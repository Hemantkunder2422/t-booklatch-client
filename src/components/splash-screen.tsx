"use client";

import { useEffect, useState } from "react";
import { BookLatchMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type Phase = "show" | "leaving" | "done";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("show");

  useEffect(() => {
    // Reveal the app after the intro, then unmount once the fade completes.
    const leave = setTimeout(() => setPhase("leaving"), 2000);
    const done = setTimeout(() => setPhase("done"), 2650);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-background transition-all duration-700 ease-out",
        phase === "leaving" && "pointer-events-none scale-105 opacity-0 blur-sm",
      )}
    >
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 size-[28rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px] [animation:splash-float_9s_ease-in-out_infinite]" />
        <div className="absolute right-1/4 bottom-1/4 size-[24rem] translate-x-1/2 rounded-full bg-chart-4/25 blur-[120px] [animation:splash-float_11s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-2/20 blur-[110px] [animation:splash-float_13s_ease-in-out_infinite]" />
      </div>

      {/* Faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Center brand */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo with pulsing rings */}
        <div className="relative">
          <span className="absolute inset-0 rounded-3xl bg-primary/40 [animation:splash-ring_2.2s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-3xl bg-primary/30 [animation:splash-ring_2.2s_ease-out_infinite_0.6s]" />
          <div className="relative flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary to-chart-4 text-primary-foreground shadow-2xl shadow-primary/40 duration-700 animate-in zoom-in-50 fade-in">
            <BookLatchMark className="size-11" />
          </div>
        </div>

        {/* Wordmark + tagline */}
        <div className="flex flex-col items-center gap-2 duration-700 animate-in fade-in slide-in-from-bottom-2">
          <h1 className="bg-[linear-gradient(110deg,var(--color-primary),var(--color-chart-4),var(--color-primary))] bg-[length:200%_auto] bg-clip-text text-2xl font-semibold tracking-tight text-transparent [animation:splash-shimmer_2.5s_linear_infinite]">
            BookLatch
          </h1>
          <p className="text-sm text-muted-foreground">
            Venue management platform
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 w-44 overflow-hidden rounded-full bg-border/60">
          <div className="h-full w-full origin-left rounded-full bg-linear-to-r from-primary to-chart-4 [animation:splash-progress_1.9s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
}
