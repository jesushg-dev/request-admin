import * as z from 'zod';
import { type TPlanInfoSchema, type TPlanFeatureSchema } from '@/services/schemas/plan';

// Base schemas for defineStepper (without internationalization)
// These are used only for the stepper definition
export const planInfoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  durationInDays: z.number().optional(),
}) as z.ZodType<TPlanInfoSchema>;

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
