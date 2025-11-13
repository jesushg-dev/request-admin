import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { optionSchema } from '@/components/custom-ui/select';
import { combinedCategoriesSchema } from '@/components/common/request/request-form-stepper/classification-step';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useReassignAreaSchema = () => {
  const t = useTranslations('admin.request.form.classificationStep.validation');
  return createReassignAreaSchema((key: string) => t(key as any));
};

/**
 * Creates a reassign area schema with internationalized error messages
 */
export function createReassignAreaSchema(t: TranslationFn) {
  return combinedCategoriesSchema.extend({
    reason: z.string().min(1, { message: t('reasonRequired') }),
    notify: optionSchema,
  });
}

/**
 * Type inference for ReassignAreaSchema
 */
export type TReassignAreaSchema = z.infer<ReturnType<typeof createReassignAreaSchema>>;

