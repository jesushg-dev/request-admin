import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useChangeStatusSchema = () => {
  const t = useTranslations('admin.request.status.validation');
  return createChangeStatusSchema((key: string) => t(key as any));
};

/**
 * Creates a change status schema with internationalized error messages
 */
export function createChangeStatusSchema(t: TranslationFn) {
  return z
    .object({
      newStatus: optionSchema,
      requiredReason: z.boolean(),
      comments: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.requiredReason && (!data.comments || data.comments.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('reasonRequired'),
        });
      }
    });
}

/**
 * Type inference for ChangeStatusSchema
 */
export type TChangeStatusSchema = z.infer<ReturnType<typeof createChangeStatusSchema>>;
