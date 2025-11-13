import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { generateUuid } from '@/lib/id';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useUserRoleAssignmentSchema() {
  const t = useTranslations('component.userRoleAssignmentForm.validation');
  return createUserRoleAssignmentSchema((key: string) => t(key as any));
}

/**
 * Creates a user role assignment schema with internationalized error messages
 */
export function createUserRoleAssignmentSchema(t: TranslationFn) {
  return z.object({
    userRoles: z.array(
      z.object({
        id: z.string().uuid().default(generateUuid),
        isActive: z.boolean().default(true),
        userId: z.object({
          value: z.string().min(1, { message: t('userRequired') }),
          label: z.string().min(1),
        }),
        roleId: z.object({
          value: z.string().min(1, { message: t('roleRequired') }),
          label: z.string().min(1),
        }),
      })
    ),
  });
}

/**
 * Type inference for UserRoleAssignmentSchema
 */
export type TUserRoleAssignmentSchema = z.infer<ReturnType<typeof createUserRoleAssignmentSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getUserRoleAssignmentSchema() {
  return createUserRoleAssignmentSchema((key: string) => key);
}

