import { type TPlanFeatureSchema, type TPlanInfoSchema, type TPlanBrandingSchema, type TPlanSelectionSchema } from '@/services/schemas/plan';
import * as z from 'zod';

// Base schemas for defineStepper (without internationalization)
// These are used only for the stepper definition
export const planInfoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  durationInDays: z.number().optional(),
}) as z.ZodType<TPlanInfoSchema>;

export const planBrandingSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
}) as z.ZodType<TPlanBrandingSchema>;

export const planSelectionSchema = z.object({
  planId: z.string().optional(),
}) as z.ZodType<TPlanSelectionSchema>;

export const planFeatureSchema = z.object({
  features: z.array(
    z.object({
      featureId: z.string().min(1),
      dailyLimit: z.number().optional(),
      totalLimit: z.number().optional(),
      resetInterval: z.string().min(1),
    })
  ),
}) as z.ZodType<TPlanFeatureSchema>;
