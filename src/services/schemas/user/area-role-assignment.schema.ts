import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useAreaRoleAssignmentSchema() {
  const t = useTranslations('admin.user.form.validation');
  return createAreaRoleAssignmentSchema((key: string) => t(key as any));
}

/**
 * Creates an area role assignment schema with internationalized error messages
 */
export function createAreaRoleAssignmentSchema(t: TranslationFn) {
  return z.object({
    areaRoles: z
      .array(
        z.object({
          id: z.string().uuid().default(generateUuid),
          areaId: z.object({
            value: z.string().min(1, { message: t('areaRequired') }),
            label: z.string().min(1),
          }),
          roleId: z.object({
            value: z.string().min(1, { message: t('roleRequired') }),
            label: z.string().min(1),
          }),
          isActive: z.boolean().default(true),
        })
      )
      .optional()
      .superRefine((areaRoles, ctx) => {
        const seen = new Set();
        if (!areaRoles) return;

        areaRoles.forEach((item, index) => {
          if (seen.has(item.areaId.value)) {
            ctx.addIssue({
              path: [`${index}.areaId`],
              code: z.ZodIssueCode.custom,
              message: t('duplicateArea'),
            });
          } else {
            seen.add(item.areaId.value);
          }
        });
      }),
  });
}

/**
 * Type inference for AreaRoleAssignmentSchema
 */
export type TAreaRoleAssignmentSchema = z.infer<ReturnType<typeof createAreaRoleAssignmentSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getAreaRoleAssignmentSchema() {
  return createAreaRoleAssignmentSchema((key: string) => key);
}
