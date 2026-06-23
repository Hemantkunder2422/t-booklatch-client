"use client";

import { useQuery } from "@tanstack/react-query";
import { getVenues } from "./api";

/** Stable query keys for the venues feature. */
export const venueKeys = {
  all: ["venues"] as const,
  list: () => [...venueKeys.all, "list"] as const,
};

/** Load the list of venues for the dashboard. */
export function useVenues() {
  return useQuery({
    queryKey: venueKeys.list(),
    queryFn: getVenues,
  });
}
