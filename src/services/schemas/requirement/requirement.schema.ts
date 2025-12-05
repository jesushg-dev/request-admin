import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useRequirementSchema = () => {
  const t = useTranslations('admin.requirement.form.validation');
  return createRequirementSchema((key: string) => t(key as any));
};

/**
 * Creates a requirement schema with internationalized error messages
 */
export function createRequirementSchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(200, { message: t('nameMaxLength') })
      .default(''),
    description: z
      .string()
      .min(1, { message: t('descriptionRequired') })
      .max(500, { message: t('descriptionMaxLength') })
      .default(''),
    isRequiredOnlyOnce: z.boolean().default(false),
    isActive: z.boolean().default(true),
    requirementType: z.object({
      label: z.string(),
      value: z.string().min(1, { message: t('requirementTypeRequired') }),
    }),
  });
}

/**
 * Type inference for RequirementSchema
 */
export type TRequirementSchema = z.infer<ReturnType<typeof createRequirementSchema>>;
