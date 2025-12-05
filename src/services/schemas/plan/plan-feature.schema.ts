import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function usePlanFeatureSchema() {
  const t = useTranslations('plans.form.featuresStep.validation');
  return createPlanFeatureSchema((key: string) => t(key as any));
}

/**
 * Creates a plan feature schema with internationalized error messages
 */
export function createPlanFeatureSchema(t: TranslationFn) {
  return z.object({
    features: z.array(
      z.object({
        featureId: z.string().min(1, { message: t('featureRequired') }),
        dailyLimit: z.number().optional(),
        totalLimit: z.number().optional(),
        resetInterval: z.string().min(1, { message: t('resetIntervalRequired') }),
      })
    ),
  });
}

/**
 * Type inference for PlanFeatureSchema
 */
export type TPlanFeatureSchema = z.infer<ReturnType<typeof createPlanFeatureSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getPlanFeatureSchema() {
  return createPlanFeatureSchema((key: string) => key);
}
