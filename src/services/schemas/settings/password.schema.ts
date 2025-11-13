import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const usePasswordChangeSchema = () => {
  const t = useTranslations('admin.setting.password.errors');
  return createPasswordChangeSchema((key: string) => t(key as any));
};

/**
 * Creates a password change schema with internationalized error messages
 */
export function createPasswordChangeSchema(t: TranslationFn) {
  return z
    .object({
      currentPassword: z.string().min(8, {
        message: t('minLength'),
      }),
      newPassword: z.string().min(8, {
        message: t('minLength'),
      }),
      confirmPassword: z.string().min(8, {
        message: t('minLength'),
      }),
      revokeOtherSessions: z.boolean(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    });
}

/**
 * Type inference for PasswordChangeSchema
 */
export type TPasswordChangeSchema = z.infer<ReturnType<typeof createPasswordChangeSchema>>;

