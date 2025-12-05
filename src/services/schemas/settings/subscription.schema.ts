import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useSubscriptionSchema = () => {
  const t = useTranslations('admin.setting.subscription.validation');
  return createSubscriptionSchema((key: string) => t(key as any));
};

/**
 * Creates a subscription schema with internationalized error messages
 */
export function createSubscriptionSchema(t: TranslationFn) {
  return z.object({
    planId: z.string().min(1, {
      message: t('planRequired'),
    }),
    isLifetime: z.boolean(),
    startDate: z.date(),
    endDate: z.date(),
  });
}

/**
 * Type inference for SubscriptionSchema
 */
export type TSubscriptionSchema = z.infer<ReturnType<typeof createSubscriptionSchema>>;
