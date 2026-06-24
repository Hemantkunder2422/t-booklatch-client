import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/* ── Primitives ──────────────────────────────────────────────────── */

/** A page title + subtitle, optionally with a trailing action button. */
export function PageHeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {action && <Skeleton className="h-9 w-32" />}
    </div>
  );
}

/** A search input + optional trailing control. */
export function FiltersBarSkeleton({ trailing = true }: { trailing?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Skeleton className="h-9 w-full max-w-sm flex-1" />
      {trailing && <Skeleton className="h-9 w-40" />}
    </div>
  );
}

/** A row of metric cards. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** A grid of content cards (spaces, packages, contacts…). */
export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

/** A bordered data table. */
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <TableCell key={c}>
                  {c === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-16" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** A vertical list of avatar rows inside a card. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** A card-wrapped form with stacked field rows. */
export function FormCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
}

/** A month-grid calendar placeholder. */
export function CalendarGridSkeleton() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-1">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 border-b pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-3 w-6" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px pt-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-none" />
        ))}
      </div>
    </Card>
  );
}

/* ── Composed page skeletons ─────────────────────────────────────── */

export function DashboardSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
          ))}
        </div>
      </div>
      <StatCardsSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableSkeleton rows={5} columns={4} />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <ListSkeleton rows={3} />
        </div>
      </div>
    </>
  );
}

export function TablePageSkeleton({
  columns = 5,
  rows = 6,
  withSummary = false,
}: {
  columns?: number;
  rows?: number;
  withSummary?: boolean;
}) {
  return (
    <>
      <PageHeaderSkeleton />
      {withSummary && <StatCardsSkeleton count={3} />}
      <FiltersBarSkeleton />
      <TableSkeleton rows={rows} columns={columns} />
    </>
  );
}

export function CardGridPageSkeleton({
  count = 6,
  withFilters = false,
}: {
  count?: number;
  withFilters?: boolean;
}) {
  return (
    <>
      <PageHeaderSkeleton />
      {withFilters && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      )}
      <CardGridSkeleton count={count} />
    </>
  );
}

export function CalendarPageSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <CalendarGridSkeleton />
        <Card className="space-y-4 p-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </Card>
      </div>
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </CardContent>
      </Card>
      <FormCardSkeleton rows={6} />
    </>
  );
}

export function SettingsSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-9 w-80 max-w-full rounded-lg" />
      <FormCardSkeleton rows={4} />
    </>
  );
}

export { Skeleton };
