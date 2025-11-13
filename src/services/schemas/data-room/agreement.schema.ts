import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useAgreementSchema = () => {
  const t = useTranslations('admin.agreement.validation');
  return createAgreementSchema((key: string) => t(key as any));
};

/**
 * Creates an agreement schema with internationalized error messages
 */
export function createAgreementSchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    name: z.string().min(1, { message: t('nameRequired') }).max(200, { message: t('nameMaxLength') }),
    description: z.string().max(500, { message: t('descriptionMaxLength') }).nullish(),
    content: z.string().min(1, { message: t('contentRequired') }).max(500, { message: t('contentMaxLength') }),
    requireName: z.boolean(),
  });
}

/**
 * Type inference for AgreementSchema
 */
export type TAgreementSchema = z.infer<ReturnType<typeof createAgreementSchema>>;

