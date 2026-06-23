export type VenueStatus = "active" | "maintenance" | "draft";

export interface Venue {
  id: string;
  name: string;
  city: string;
  capacity: number;
  pricePerDay: number;
  status: VenueStatus;
  bookingsThisMonth: number;
}
