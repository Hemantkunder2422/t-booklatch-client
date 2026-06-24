import { http } from "@/lib/http";
import type { Id, ListParams, Paginated } from "@/types/api";

/**
 * EXAMPLE SERVICE — copy this shape for each domain (venues, invoices, …).
 *
 * A "service" is just the data layer: pure functions that call the API via the
 * typed `http` helper. No React here. Query/mutation hooks (see
 * `src/hooks/queries`) wrap these with TanStack Query.
 */

export interface BookingDto {
  id: Id;
  customer: string;
  space: string;
  date: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
}

export interface CreateBookingInput {
  customer: string;
  space: string;
  date: string;
  amount: number;
}

export type UpdateBookingInput = Partial<CreateBookingInput> & {
  status?: BookingDto["status"];
};

export const bookingsService = {
  list: (params?: ListParams) =>
    http.get<Paginated<BookingDto>>("/bookings", { params }),

  getById: (id: Id) => http.get<BookingDto>(`/bookings/${id}`),

  create: (input: CreateBookingInput) =>
    http.post<BookingDto>("/bookings", input),

  update: (id: Id, input: UpdateBookingInput) =>
    http.patch<BookingDto>(`/bookings/${id}`, input),

  remove: (id: Id) => http.delete<void>(`/bookings/${id}`),
};
