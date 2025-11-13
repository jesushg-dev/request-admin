import { z } from 'zod';
import { useTranslations } from 'next-intl';

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
  return z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    prefix: z.string().min(1, { message: t('prefixRequired') }),
    expiresIn: z.enum(['never', '7d', '30d', '90d', '1y']),
    metadata: z.object({}),
    rateLimitEnabled: z.boolean().default(false),
    rateLimitMax: z.number().optional(),
    rateLimitTimeWindow: z.number().optional(),
  });
}

/**
 * Type inference for ApiKeyFormSchema
 */
export type TApiKeyFormSchema = z.infer<ReturnType<typeof createApiKeyFormSchema>>;

