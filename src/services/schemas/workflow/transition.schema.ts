import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useTransitionSchema = () => {
  const t = useTranslations('admin.workflow.transition.validation');
  return createTransitionSchema((key: string) => t(key as any));
};

/**
 * Creates a transition schema with internationalized error messages
 */
export function createTransitionSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    label: z.string().min(1, { message: t('nameRequired') }),
    description: z.string().optional(),
    requiresApproval: z.boolean().default(false),
    requiresJustification: z.boolean().default(false),
  });
}

/**
 * Type inference for TransitionSchema
 */
export type TTransitionSchema = z.infer<ReturnType<typeof createTransitionSchema>>;
