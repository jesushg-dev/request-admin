import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useSpacerFieldPropertiesSchema = () => {
  const t = useTranslations('component.form.builderFields.properties.validation');
  return createSpacerFieldPropertiesSchema((key: string) => t(key as any));
};

/**
 * Creates a spacer field properties schema with internationalized error messages
 */
export function createSpacerFieldPropertiesSchema(t: TranslationFn) {
  return z.object({
    height: z.number().min(5, { message: t('heightMin') }).max(200, { message: t('heightMax') }),
  });
}

/**
 * Type inference for SpacerFieldPropertiesSchema
 */
export type TSpacerFieldPropertiesSchema = z.infer<ReturnType<typeof createSpacerFieldPropertiesSchema>>;

