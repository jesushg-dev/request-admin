import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useTextAreaFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createTextAreaFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a textarea field properties schema with internationalized error messages
 */
export function createTextAreaFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    label: z
      .string()
      .min(2, { message: t('labelMinLength') })
      .max(50, { message: t('labelMaxLength') }),
    helperText: z.string().max(200, { message: t('helperTextMaxLength') }),
    required: z.boolean(),
    placeHolder: z.string().max(50, { message: t('placeholderMaxLength') }),
    rows: z
      .number()
      .min(1, { message: t('rowsMin') })
      .max(10, { message: t('rowsMax') }),
  });
}

/**
 * Type inference for TextAreaFieldPropertiesSchema
 */
export type TTextAreaFieldPropertiesSchema = z.infer<ReturnType<typeof createTextAreaFieldPropertiesSchema>>;
