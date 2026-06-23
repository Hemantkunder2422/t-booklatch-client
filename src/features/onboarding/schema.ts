import { z } from "zod";

const optionalString = z.string().trim().optional().or(z.literal(""));

export const venueSchema = z.object({
  name: z.string().trim().min(2, "Venue name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "Contact email is required")
    .email("Enter a valid email address"),
  phone: optionalString,
  addressLine: optionalString,
  city: optionalString,
  country: optionalString,
  postalCode: optionalString,
});

export const spaceImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

export const spaceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Space name is required"),
  type: z.string().min(1, "Choose a space type"),
  layout: z.enum(["indoor", "outdoor", "hybrid"]),
  seatedCapacity: optionalString,
  standingCapacity: optionalString,
  pricePerDay: optionalString,
  amenities: z.array(z.string()),
  images: z.array(spaceImageSchema),
});

export const integrationsSchema = z.object({
  paymentGateway: z.string().min(1, "Select a payment gateway to continue"),
  channels: z.array(z.string()),
});

export const onboardingSchema = z.object({
  venue: venueSchema,
  spaces: z.array(spaceSchema).min(1, "Add at least one space"),
  integrations: integrationsSchema,
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
