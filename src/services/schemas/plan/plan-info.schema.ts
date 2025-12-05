import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function usePlanInfoSchema() {
  const t = useTranslations('plans.form.planStep.validation');
  return createPlanInfoSchema((key: string) => t(key as any));
}

/**
 * Creates a plan info schema with internationalized error messages
 */
export function createPlanInfoSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    description: z.string().min(1, { message: t('descriptionRequired') }),
    price: z.number().min(0, { message: t('priceMin') }),
    durationInDays: z.number().optional(),
  });
}

/**
 * Type inference for PlanInfoSchema
 */
export type TPlanInfoSchema = z.infer<ReturnType<typeof createPlanInfoSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getPlanInfoSchema() {
  return createPlanInfoSchema((key: string) => key);
}
