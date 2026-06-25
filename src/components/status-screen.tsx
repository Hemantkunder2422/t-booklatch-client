import { BookLatchLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * Shared full-bleed status screen for 404 / error pages.
 * Plain component (no hooks) so both server `not-found.tsx` and client
 * `error.tsx` can render it.
 */
export function StatusScreen({
  code,
  title,
  description,
  footer,
  className,
  children,
}: {
  code: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center",
        className,
      )}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] [animation:splash-float_10s_ease-in-out_infinite]" />
        <div className="absolute right-1/4 bottom-1/4 size-[22rem] rounded-full bg-chart-4/10 blur-[110px] [animation:splash-float_13s_ease-in-out_infinite_reverse]" />
        <div
          className="absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_50%_50%_at_50%_45%,black,transparent)]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="duration-700 animate-in fade-in slide-in-from-bottom-3">
        <BookLatchLogo className="mb-8" />

        <p className="bg-[linear-gradient(110deg,var(--color-primary),var(--color-chart-4),var(--color-primary))] bg-[length:200%_auto] bg-clip-text text-[5.5rem] leading-none font-bold tracking-tight text-transparent [animation:splash-shimmer_3s_linear_infinite] sm:text-[7rem]">
          {code}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {description}
        </p>

        {children && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {children}
          </div>
        )}

        {footer && (
          <p className="mt-6 text-xs text-muted-foreground/70">{footer}</p>
        )}
      </div>
    </div>
  );
}
