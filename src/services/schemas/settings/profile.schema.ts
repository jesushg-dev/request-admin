import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useProfileSchema = () => {
  const t = useTranslations('admin.setting.account.validation');
  return createProfileSchema((key: string) => t(key as any));
};

/**
 * Creates a profile schema with internationalized error messages
 */
export function createProfileSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(2, {
      message: t('nameMinLength'),
    }),
    email: z.email({
      message: t('emailInvalid'),
    }),
    username: z
      .string()
      .min(2, {
        message: t('usernameMinLength'),
      })
      .optional(),
    displayUsername: z
      .string()
      .min(2, {
        message: t('displayUsernameMinLength'),
      })
      .optional(),
    phoneNumber: z.string().optional(),
    image: z.string().optional(),
  });
}

/**
 * Type inference for ProfileSchema
 */
export type TProfileSchema = z.infer<ReturnType<typeof createProfileSchema>>;
