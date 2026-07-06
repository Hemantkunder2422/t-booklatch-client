import { cn } from "@/lib/utils";

/**
 * BookLatch brand mark — a custom "b/L" monogram ligature (Book + Latch):
 * a shared stem with an L foot and a B-style bowl. Uses `currentColor`.
 */
export function BookLatchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 6V25H20M10 6H15.5A4.8 4.8 0 0 1 15.5 15.6H10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Full logo: gradient tile + mark, with an optional "BookLatch" wordmark.
 */
export function BookLatchLogo({
  className,
  iconClassName,
  textClassName,
  showText = true,
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-chart-4 text-white shadow-sm",
          iconClassName,
        )}
      >
        <BookLatchMark className="size-[58%]" />
      </span>
      {showText && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            textClassName,
          )}
        >
          BookLatch
        </span>
      )}
    </span>
  );
}
