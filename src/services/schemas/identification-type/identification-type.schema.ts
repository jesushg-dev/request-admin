import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useIdentificationTypeSchema = () => {
  const t = useTranslations('admin.identificationType.form.validation');
  return createIdentificationTypeSchema((key: string) => t(key as any));
};

/**
 * Creates an identification type schema with internationalized error messages
 */
export function createIdentificationTypeSchema(t: TranslationFn) {
  return z.object({
    id: z.string().optional(),
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(150, { message: t('nameMaxLength') }),
    description: z
      .string()
      .max(500, { message: t('descriptionMaxLength') })
      .optional(),
    regex: z
      .string()
      .max(500, { message: t('regexMaxLength') })
      .optional(),
    testInput: z
      .string()
      .max(500, { message: t('testInputMaxLength') })
      .optional(),
  });
}

/**
 * Type inference for IdentificationTypeSchema
 */
export type TIdentificationTypeSchema = z.infer<ReturnType<typeof createIdentificationTypeSchema>>;
