import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useEmailChangeSchema = () => {
  const t = useTranslations('admin.setting.email.validation');
  return createEmailChangeSchema((key: string) => t(key as any));
};

/**
 * Creates an email change schema with internationalized error messages
 */
export function createEmailChangeSchema(t: TranslationFn) {
  return z.object({
    newEmail: z.email({
      message: t('emailInvalid'),
    }),
    callbackURL: z.string(),
  });
}

/**
 * Type inference for EmailChangeSchema
 */
export type TEmailChangeSchema = z.infer<ReturnType<typeof createEmailChangeSchema>>;

