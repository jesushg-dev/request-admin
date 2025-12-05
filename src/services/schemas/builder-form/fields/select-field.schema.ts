import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useSelectFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createSelectFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a select field properties schema with internationalized error messages
 */
export function createSelectFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    label: z
      .string()
      .min(2, { message: t('labelMinLength') })
      .max(50, { message: t('labelMaxLength') }),
    helperText: z.string().max(200, { message: t('helperTextMaxLength') }),
    required: z.boolean(),
    placeHolder: z.string().max(50, { message: t('placeholderMaxLength') }),
    options: z.array(z.string()),
  });
}

/**
 * Type inference for SelectFieldPropertiesSchema
 */
export type TSelectFieldPropertiesSchema = z.infer<ReturnType<typeof createSelectFieldPropertiesSchema>>;
