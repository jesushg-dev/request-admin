import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useChangePrioritySchema = () => {
  const t = useTranslations('admin.request.priority.validation');
  return createChangePrioritySchema((key: string) => t(key as any));
};

/**
 * Creates a change priority schema with internationalized error messages
 */
export function createChangePrioritySchema(t: TranslationFn) {
  return z.object({
    reason: z
      .string()
      .min(1, { message: t('reasonRequired') })
      .max(500, { message: t('reasonMaxLength') }),
    newPriority: optionSchema,
    notify: optionSchema,
  });
}

/**
 * Type inference for ChangePrioritySchema
 */
export type TChangePrioritySchema = z.infer<ReturnType<typeof createChangePrioritySchema>>;
