export interface VenueInfo {
  name: string;
  description: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  postalCode: string;
}

export type SpaceLayout = "indoor" | "outdoor" | "hybrid";

export interface SpaceImage {
  id: string;
  name: string;
  url: string;
}

export interface VenueSpace {
  id: string;
  name: string;
  type: string;
  layout: SpaceLayout;
  seatedCapacity: string;
  standingCapacity: string;
  pricePerDay: string;
  amenities: string[];
  images: SpaceImage[];
}

export interface IntegrationSelection {
  paymentGateway: string;
  channels: string[];
}

export interface OnboardingData {
  venue: VenueInfo;
  spaces: VenueSpace[];
  integrations: IntegrationSelection;
}
