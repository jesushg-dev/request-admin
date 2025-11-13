import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useCheckboxFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createCheckboxFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a checkbox field properties schema with internationalized error messages
 */
export function createCheckboxFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    label: z.string().min(2, { message: t('labelMinLength') }).max(50, { message: t('labelMaxLength') }),
    helperText: z.string().max(200, { message: t('helperTextMaxLength') }),
    required: z.boolean(),
  });
}

/**
 * Type inference for CheckboxFieldPropertiesSchema
 */
export type TCheckboxFieldPropertiesSchema = z.infer<ReturnType<typeof createCheckboxFieldPropertiesSchema>>;

