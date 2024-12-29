import { z } from 'zod';

export const tenantDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  title: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
    .optional(),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

export const modulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      isActive: z.boolean(),
    })
  ),
});

export const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
});

export const tenantFormSchema = tenantDetailsSchema.merge(modulesSchema).merge(planSelectionSchema);

export type TenantFormData = z.infer<typeof tenantFormSchema>;
export type TenantDetailsData = z.infer<typeof tenantDetailsSchema>;
export type ModulesData = z.infer<typeof modulesSchema>;
export type PlanSelectionData = z.infer<typeof planSelectionSchema>;

export interface Module {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInDays?: number;
}
