import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useUserSchema() {
  const t = useTranslations('admin.user.form.validation');
  return createUserSchema((key: string) => t(key as any));
}

/**
 * Creates a user schema with internationalized error messages
 */
export function createUserSchema(t: TranslationFn) {
  return z.object({
    user: z
      .object({
        id: z.string(),
        email: z.string().email({ message: t('emailInvalid') }),
        isActive: z.boolean().default(true),
        isTwoFactorRequired: z.boolean().default(false),
        isAdmin: z.boolean().default(false),
        firstName: z.string().min(1, { message: t('firstNameRequired') }),
        lastName: z.string().min(1, { message: t('lastNameRequired') }),
        phone: z.string(),
        identificationNumber: z.string(),
        identificationTypeId: z.object({
          label: z.string(),
          value: z.string(),
        }),
        isEditing: z.boolean().default(false),
      })
      .superRefine((user, ctx) => {
        if (user.isEditing) {
          if (!user.phone || user.phone.trim().length === 0) {
            ctx.addIssue({
              path: ['phone'],
              code: z.ZodIssueCode.custom,
              message: t('phoneRequired'),
            });
          }
          if (!user.identificationNumber || user.identificationNumber.trim().length === 0) {
            ctx.addIssue({
              path: ['identificationNumber'],
              code: z.ZodIssueCode.custom,
              message: t('identificationNumberRequired'),
            });
          }
          if (!user.identificationTypeId.value || user.identificationTypeId.value.trim().length === 0) {
            ctx.addIssue({
              path: ['identificationTypeId', 'value'],
              code: z.ZodIssueCode.custom,
              message: t('identificationTypeRequired'),
            });
          }
        }
      }),
  });
}

/**
 * Type inference for UserSchema
 */
export type TUserSchema = z.infer<ReturnType<typeof createUserSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getUserSchema() {
  return createUserSchema((key: string) => key);
}

