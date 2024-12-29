import * as z from 'zod';

export const planInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  durationInDays: z.number().optional(),
});

export const planFeatureSchema = z.object({
  features: z.array(
    z.object({
      featureId: z.string().min(1, 'Feature selection is required'),
      dailyLimit: z.number().optional(),
      totalLimit: z.number().optional(),
      resetInterval: z.string().min(1, 'Reset interval is required'),
    })
  ),
});
