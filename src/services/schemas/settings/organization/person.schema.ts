import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const usePersonSchema = () => {
  const t = useTranslations('admin.setting.organizationPerson.form');
  return createPersonSchema((key: string) => t(key as any));
};

/**
 * Creates a person schema with internationalized error messages
 */
export function createPersonSchema(t: TranslationFn) {
  return z.object({
    firstName: z.string().min(2, {
      message: t('firstName.error'),
    }),
    lastName: z.string().min(2, {
      message: t('lastName.error'),
    }),
    phone: z.string().optional(),
    identificationNumber: z.string().min(1, {
      message: t('identificationNumber.error'),
    }),
    identificationTypeId: z.string().min(1, {
      message: t('identificationType.error'),
    }),
    image: z.string().optional(),
  });
}

/**
 * Type inference for PersonSchema
 */
export type TPersonSchema = z.infer<ReturnType<typeof createPersonSchema>>;
