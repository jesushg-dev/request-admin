import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { generateUuid } from '@/lib/id';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useRolesSchema() {
  const t = useTranslations('component.rolesForm.validation');
  return createRolesSchema((key: string) => t(key as any));
}

/**
 * Creates a roles schema with internationalized error messages
 */
export function createRolesSchema(t: TranslationFn) {
  return z.object({
    roles: z
      .array(
        z.object({
          id: z.string().uuid().default(generateUuid),
          name: z.string().min(3, { message: t('nameMinLength') }).max(100, { message: t('nameMaxLength') }),
          description: z.string().max(255, { message: t('descriptionMaxLength') }).optional(),
          isActive: z.boolean(),
          features: z.array(
            z.object({
              id: z.string().uuid().default(generateUuid),
              moduleId: z.string(),
              moduleName: z.string(),
              moduleDescription: z.string().nullable(),
              featureId: z.string(),
              featureName: z.string(),
              featureDescription: z.string().nullable(),
              isActive: z.boolean().optional(),
            })
          ),
        })
      )
      .superRefine((roles, ctx) => {
        const seen = new Set<string>();
        roles.forEach((role, index) => {
          if (seen.has(role.name)) {
            ctx.addIssue({
              path: [`${index}.name`],
              code: z.ZodIssueCode.custom,
              message: t('duplicateName'),
            });
          } else {
            seen.add(role.name);
          }
        });
      }),
  });
}

/**
 * Type inference for RolesSchema
 */
export type TRolesSchema = z.infer<ReturnType<typeof createRolesSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getRolesSchema() {
  return createRolesSchema((key: string) => key);
}

