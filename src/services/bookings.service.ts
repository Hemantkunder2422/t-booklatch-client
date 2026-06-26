import { http } from "@/lib/http";
import type { Id, ListParams, Paginated } from "@/types/api";
import type { Booking } from "@/types/models";

/**
 * EXAMPLE SERVICE — copy this shape for each domain (venues, enquiries, …).
 *
 * A "service" is just the data layer: pure functions that call the API via the
 * typed `http` helper. Types come from `@/types/models` (mirrors Prisma).
 */

export type CreateBookingInput = Omit<Booking, "id">;
export type UpdateBookingInput = Partial<CreateBookingInput>;

export const bookingsService = {
  list: (params?: ListParams) =>
    http.get<Paginated<Booking>>("/bookings", { params }),

  getById: (id: Id) => http.get<Booking>(`/bookings/${id}`),

  create: (input: CreateBookingInput) =>
    http.post<Booking>("/bookings", input),

  update: (id: Id, input: UpdateBookingInput) =>
    http.patch<Booking>(`/bookings/${id}`, input),

  remove: (id: Id) => http.delete<void>(`/bookings/${id}`),
};
