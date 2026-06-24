import type { Id, ListParams } from "@/types/api";

/**
 * Centralized, type-safe query-key factory.
 *
 * Use these everywhere instead of inline arrays so invalidation stays reliable:
 *
 *   useQuery({ queryKey: queryKeys.bookings.list(filters), queryFn: ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
 *
 * Add a new domain by copying the `entityKeys` shape below.
 */
function entityKeys<const TScope extends string>(scope: TScope) {
  const all = [scope] as const;
  return {
    all,
    lists: () => [...all, "list"] as const,
    list: (params?: ListParams | Record<string, unknown>) =>
      [...all, "list", params ?? {}] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: Id) => [...all, "detail", id] as const,
  };
}

export const queryKeys = {
  venues: entityKeys("venues"),
  bookings: entityKeys("bookings"),
  invoices: entityKeys("invoices"),
  customers: entityKeys("customers"),
  contacts: entityKeys("contacts"),
  enquiries: entityKeys("enquiries"),
  spaces: entityKeys("spaces"),
  packages: entityKeys("packages"),
  staff: entityKeys("staff"),
  calendar: entityKeys("calendar"),
} as const;

export { entityKeys };
