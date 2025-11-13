import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useTitleFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createTitleFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a title field properties schema with internationalized error messages
 */
export function createTitleFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    title: z.string().min(2, { message: t('titleMinLength') }).max(50, { message: t('titleMaxLength') }),
  });
}

/**
 * Type inference for TitleFieldPropertiesSchema
 */
export type TTitleFieldPropertiesSchema = z.infer<ReturnType<typeof createTitleFieldPropertiesSchema>>;

