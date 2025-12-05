import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useLevelsSchema() {
  const t = useTranslations('admin.hierarchy.stepsForm.validation');
  return createLevelsSchema((key: string) => t(key as any));
}

/**
 * Creates a levels schema with internationalized error messages
 */
export function createLevelsSchema(t: TranslationFn) {
  const levelSchema = z.object({
    id: z.string(),
    name: z
      .string()
      .min(1, { message: t('levelNameRequired') })
      .max(100, { message: t('levelNameMaxLength') }),
    description: z
      .string()
      .max(255, { message: t('levelDescriptionMaxLength') })
      .optional(),
    isActive: z.boolean().default(true),
  });

  return z.object({
    levels: z.array(levelSchema).min(1, { message: t('atLeastOneLevelRequired') }),
  });
}

/**
 * Type inference for LevelsSchema
 */
export type TLevelsSchema = z.infer<ReturnType<typeof createLevelsSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 * This is used only for defineStepper which needs schema at module level
 * The actual validation will use the hook version with internationalization
 */
export function getLevelsSchema() {
  return createLevelsSchema((key: string) => key);
}
