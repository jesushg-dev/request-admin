import { useTranslations } from 'next-intl';
import { z } from 'zod';

/**
 * Auth Schemas with Next-Intl Internationalization
 * ==================================================
 *
 * This file contains Zod schemas for authentication forms that support
 * internationalization through next-intl.
 *
 * For Client Components - Use the hooks (useLoginSchema, etc.):
 * ```tsx
 * 'use client';
 * import { useLoginSchema, type TLoginSchema } from '@/services/schemas/auth.schema';
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const loginSchema = useLoginSchema();
 * const form = useForm<TLoginSchema>({
 *   resolver: zodResolver(loginSchema),
 * });
 * ```
 *
 * For Server Actions - Use the factory functions:
 * ```tsx
 * 'use server';
 * import { createLoginSchema } from '@/services/schemas/auth.schema';
 * import { getTranslations } from 'next-intl/server';
 *
 * const t = await getTranslations('auth.validation');
 * const schema = createLoginSchema(t);
 * const result = schema.safeParse(data);
 * ```
 */

// Type helper for translation function - accepts any function that takes a string and returns a string
// Using `any` for the key parameter to be compatible with next-intl's typed Translator
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 * Uses useTranslations internally, so you don't need to call it in your component
 *
 * Example:
 * ```tsx
 * 'use client';
 * import { useLoginSchema, type TLoginSchema } from '@/services/schemas/auth.schema';
 *
 * const loginSchema = useLoginSchema();
 * ```
 */
export const useLoginSchema = () => {
  const t = useTranslations('auth.validation');
  return createLoginSchema((key: string) => t(key as any));
};

/**
 * Creates a login schema with internationalized error messages
 */
export function createLoginSchema(t: TranslationFn) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailEmpty') })
      .email({ message: t('emailInvalid') }),
    password: z.string().min(1, { message: t('passwordEmpty') }),
    remember: z.boolean().optional(),
  });
}

/**
 * Type inference for LoginSchema
 */
export type TLoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Hook for use in client components
 */
export const useRegisterSchema = () => {
  const t = useTranslations('auth.validation');
  return createRegisterSchema((key: string) => t(key as any));
};

/**
 * Creates a register schema with internationalized error messages
 */
export function createRegisterSchema(t: TranslationFn) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailEmpty') })
      .email({ message: t('emailInvalid') }),
    password: z.string().min(6, { message: t('passwordMinLength') }),
    username: z.string().min(1, { message: t('usernameEmpty') }),
  });
}

/**
 * Type inference for RegisterSchema
 */
export type TRegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;

/**
 * Hook for use in client components
 */
export const useResetSchema = () => {
  const t = useTranslations('auth.validation');
  return createResetSchema((key: string) => t(key as any));
};

/**
 * Creates a reset password schema with internationalized error messages
 */
export function createResetSchema(t: TranslationFn) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailEmpty') })
      .email({ message: t('emailInvalid') }),
  });
}

/**
 * Type inference for ResetSchema
 */
export type TResetSchema = z.infer<ReturnType<typeof createResetSchema>>;

/**
 * Hook for use in client components
 */
export const useNewPasswordSchema = () => {
  const t = useTranslations('auth.validation');
  return createNewPasswordSchema((key: string) => t(key as any));
};

/**
 * Creates a new password schema with internationalized error messages
 */
export function createNewPasswordSchema(t: TranslationFn) {
  return z.object({
    password: z.string().min(6, { message: t('passwordMinLength') }),
  });
}

/**
 * Type inference for NewPasswordSchema
 */
export type TNewPasswordSchema = z.infer<ReturnType<typeof createNewPasswordSchema>>;

/**
 * Hook for use in client components
 */
export const useSettingsSchema = () => {
  const t = useTranslations('auth.validation');
  return createSettingsSchema((key: string) => t(key as any));
};

/**
 * Creates a settings schema with internationalized error messages
 */
export function createSettingsSchema(t: TranslationFn) {
  return z
    .object({
      name: z.optional(z.string()),
      isTwoFactorEnabled: z.optional(z.boolean()),
      features: z.optional(z.array(z.string())),
      email: z.optional(z.string().email({ message: t('emailInvalid') })),
      password: z.optional(z.string().min(6, { message: t('passwordMinLength') })),
      newPassword: z.optional(z.string().min(6, { message: t('passwordMinLength') })),
    })
    .refine(
      (data) => {
        if (data.password && !data.newPassword) {
          return false;
        }
        return true;
      },
      {
        message: t('newPasswordRequired'),
        path: ['newPassword'],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && !data.password) {
          return false;
        }
        return true;
      },
      {
        message: t('passwordRequired'),
        path: ['password'],
      }
    );
}

/**
 * Type inference for SettingsSchema
 */
export type TSettingsSchema = z.infer<ReturnType<typeof createSettingsSchema>>;
