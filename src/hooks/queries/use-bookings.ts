"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  bookingsService,
  type CreateBookingInput,
  type UpdateBookingInput,
} from "@/services/bookings.service";
import type { ApiError, Id, ListParams } from "@/types/api";

/**
 * EXAMPLE HOOKS — the TanStack Query layer over a service.
 *
 * Pattern per domain:
 *   - one `useXList(params)` query
 *   - one `useX(id)` detail query
 *   - `useCreateX` / `useUpdateX` / `useDeleteX` mutations that invalidate keys
 *
 * You can keep these centralized here, or co-locate them inside features
 * (e.g. `features/bookings/use-bookings.ts`) — both work; pick one convention.
 */

export function useBookings(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => bookingsService.list(params),
  });
}

export function useBooking(id: Id) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      toast.success("Booking created");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateBooking(id: Id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBookingInput) =>
      bookingsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      toast.success("Booking updated");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) => bookingsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      toast.success("Booking deleted");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
