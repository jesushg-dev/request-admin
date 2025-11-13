import { z } from 'zod';
import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function (for future use)
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useUserTenantSchema = () => {
  return createUserTenantSchema();
};

/**
 * Creates a user tenant schema
 * No validation messages needed currently, but keeping pattern consistent for future use
 */
export function createUserTenantSchema(t?: TranslationFn) {
  return z.object({
    isActive: z.boolean(),
    isTermAccepted: z.boolean(),
    role: z.array(optionSchema),
  });
}

/**
 * Type inference for UserTenantSchema
 */
export type TUserTenantSchema = z.infer<ReturnType<typeof createUserTenantSchema>>;

