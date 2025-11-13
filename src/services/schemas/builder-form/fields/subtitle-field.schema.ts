import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useSubtitleFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createSubtitleFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a subtitle field properties schema with internationalized error messages
 */
export function createSubtitleFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    title: z.string().min(2, { message: t('titleMinLength') }).max(50, { message: t('titleMaxLength') }),
  });
}

/**
 * Type inference for SubtitleFieldPropertiesSchema
 */
export type TSubtitleFieldPropertiesSchema = z.infer<ReturnType<typeof createSubtitleFieldPropertiesSchema>>;

