import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useStateSchema = () => {
  const t = useTranslations('admin.workflow.state.validation');
  return createStateSchema((key: string) => t(key as any));
};

/**
 * Creates a state schema with internationalized error messages
 */
export function createStateSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    label: z.string().min(1, { message: t('nameRequired') }),
    description: z.string().optional(),
    color: optionSchema,
    type: optionSchema,
  });
}

/**
 * Type inference for StateSchema
 */
export type TStateSchema = z.infer<ReturnType<typeof createStateSchema>>;
