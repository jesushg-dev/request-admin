import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useRequirementTypeSchema = () => {
  const t = useTranslations('admin.requirementType.form.validation');
  return createRequirementTypeSchema((key: string) => t(key as any));
};

/**
 * Creates a requirement type schema with internationalized error messages
 */
export function createRequirementTypeSchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(100, { message: t('nameMaxLength') }),
    description: z
      .string()
      .max(500, { message: t('descriptionMaxLength') })
      .optional()
      .default(''),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  });
}

/**
 * Type inference for RequirementTypeSchema
 */
export type TRequirementTypeSchema = z.infer<ReturnType<typeof createRequirementTypeSchema>>;
