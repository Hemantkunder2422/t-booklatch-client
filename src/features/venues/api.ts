import { api } from "@/lib/axios";
import type { Venue } from "./types";

/**
 * Sample dataset returned when no backend is wired up yet.
 * Replace `getVenues` with the real request once the API is available.
 */
const SAMPLE_VENUES: Venue[] = [
  {
    id: "v_001",
    name: "Grand Atrium Hall",
    city: "San Francisco",
    capacity: 850,
    pricePerDay: 4200,
    status: "active",
    bookingsThisMonth: 18,
  },
  {
    id: "v_002",
    name: "Riverside Pavilion",
    city: "Austin",
    capacity: 320,
    pricePerDay: 1900,
    status: "active",
    bookingsThisMonth: 11,
  },
  {
    id: "v_003",
    name: "The Glasshouse Loft",
    city: "New York",
    capacity: 140,
    pricePerDay: 2600,
    status: "maintenance",
    bookingsThisMonth: 4,
  },
  {
    id: "v_004",
    name: "Skyline Rooftop",
    city: "Chicago",
    capacity: 200,
    pricePerDay: 3100,
    status: "draft",
    bookingsThisMonth: 0,
  },
];

/**
 * Fetch venues for the current organization.
 *
 * Wired through the shared axios instance. When the backend isn't
 * available yet, it falls back to the sample dataset so the UI renders.
 */
export async function getVenues(): Promise<Venue[]> {
  try {
    const { data } = await api.get<Venue[]>("/venues");
    return data;
  } catch {
    return SAMPLE_VENUES;
  }
}
