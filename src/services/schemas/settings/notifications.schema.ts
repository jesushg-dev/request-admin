import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useNotificationsSchema = () => {
  const t = useTranslations('admin.setting.notifications.validation');
  return createNotificationsSchema((key: string) => t(key as any));
};

/**
 * Creates a notifications schema with internationalized error messages
 */
export function createNotificationsSchema(t: TranslationFn) {
  return z.object({
    notifyType: z.enum(['all', 'mentions', 'none'], t('notifyTypeRequired')),
    communicationEmails: z.boolean(),
    marketingEmails: z.boolean(),
    socialEmails: z.boolean(),
    securityEmails: z.boolean(),
    mobileDifferent: z.boolean(),
  });
}

/**
 * Type inference for NotificationsSchema
 */
export type TNotificationsSchema = z.infer<ReturnType<typeof createNotificationsSchema>>;

