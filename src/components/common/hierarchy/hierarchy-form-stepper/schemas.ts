import { z } from 'zod';

export const hierarchySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(255, 'Description must be 255 characters or less').optional(),
  type: z.enum(['Request', 'Assignment'], {
    required_error: 'Please select a hierarchy type',
  }),
});

export const levelsSchema = z.object({
  levels: z
    .array(
      z.object({
        name: z.string().min(1, 'Level name is required').max(100, 'Level name must be 100 characters or less'),
      })
    )
    .min(1, 'At least one hierarchy level is required'),
});

export const summarySchema = z.object({});

export type HierarchyFormValues = z.infer<typeof hierarchySchema> & z.infer<typeof levelsSchema>;
