import { z } from "zod";

export const kycSubmitSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Valid email required"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z
    .string()
    .length(3, "Country must be 3-letter ISO code (e.g., USA, GBR, BRA)"),
});

export type KycSubmitData = z.infer<typeof kycSubmitSchema>;
