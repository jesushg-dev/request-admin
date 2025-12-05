import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useUserRoleSchema() {
  const t = useTranslations('admin.user.form.validation');
  return createUserRoleSchema((key: string) => t(key as any));
}

/**
 * Creates a user role schema with internationalized error messages
 */
export function createUserRoleSchema(t: TranslationFn) {
  const roleSchema = z.object({
    id: z.string().uuid().default(generateUuid),
    roleId: z.object({ value: z.string().min(1, { message: t('roleRequired') }), label: z.string() }),
    isActive: z.boolean().default(true),
  });

  return z.object({
    roles: z.array(roleSchema).optional(),
  });
}

/**
 * Type inference for UserRoleSchema
 */
export type TUserRoleSchema = z.infer<ReturnType<typeof createUserRoleSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getUserRoleSchema() {
  return createUserRoleSchema((key: string) => key);
}
