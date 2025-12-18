import { z } from 'zod';

// Organization step schema (basic info + contact)
export const organizationSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  logo: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  title: z.string().optional(),
  description: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

// Branding step schema
export const brandingSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

// Plan selection schema (already exists in plan-selection-step.tsx)
export { planSelectionSchema } from './plan-selection-step';
