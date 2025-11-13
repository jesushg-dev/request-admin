import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useParagraphFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createParagraphFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a paragraph field properties schema with internationalized error messages
 */
export function createParagraphFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    text: z.string().min(2, { message: t('textMinLength') }).max(500, { message: t('textMaxLength') }),
  });
}

/**
 * Type inference for ParagraphFieldPropertiesSchema
 */
export type TParagraphFieldPropertiesSchema = z.infer<ReturnType<typeof createParagraphFieldPropertiesSchema>>;

