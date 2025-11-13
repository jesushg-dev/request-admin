import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useNumberFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createNumberFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a number field properties schema with internationalized error messages
 */
export function createNumberFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    label: z.string().min(2, { message: t('labelMinLength') }).max(50, { message: t('labelMaxLength') }),
    helperText: z.string().max(200, { message: t('helperTextMaxLength') }),
    required: z.boolean(),
    placeHolder: z.string().max(50, { message: t('placeholderMaxLength') }),
  });
}

/**
 * Type inference for NumberFieldPropertiesSchema
 */
export type TNumberFieldPropertiesSchema = z.infer<ReturnType<typeof createNumberFieldPropertiesSchema>>;

