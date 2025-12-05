import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useApiKeyFormSchema = () => {
  const t = useTranslations('admin.setting.apiKeys.createForm.validation');
  return createApiKeyFormSchema((key: string) => t(key as any));
};

/**
 * Creates an API key form schema with internationalized error messages
 */
export function createApiKeyFormSchema(t: TranslationFn) {
  return z
    .object({
      name: z.string().min(1, { message: t('nameRequired') }),
      prefix: z.string().min(1, { message: t('prefixRequired') }),
      expiresIn: z.enum(['never', '7d', '30d', '90d', '1y']),
      metadata: z.record(z.string(), z.any()).nullable().default({}).optional(),
      rateLimitEnabled: z.boolean().default(false),
      rateLimitMax: z.number().int().positive().optional(),
      rateLimitTimeWindow: z.number().int().positive().optional(),
      remaining: z.number().int().positive().optional(),
      refillAmount: z.number().int().positive().optional(),
      refillInterval: z.number().int().positive().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.rateLimitEnabled) {
        if (!values.rateLimitMax) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('rateLimitMaxRequired'),
            path: ['rateLimitMax'],
          });
        }

        if (!values.rateLimitTimeWindow) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('rateLimitTimeWindowRequired'),
            path: ['rateLimitTimeWindow'],
          });
        }
      }

      if ((values.refillAmount && !values.refillInterval) || (!values.refillAmount && values.refillInterval)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('refillFieldsRequired'),
          path: values.refillAmount ? ['refillInterval'] : ['refillAmount'],
        });
      }
    });
}

/**
 * Type inference for ApiKeyFormSchema
 */
export type TApiKeyFormSchema = z.infer<ReturnType<typeof createApiKeyFormSchema>>;
