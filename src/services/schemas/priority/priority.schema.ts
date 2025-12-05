import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const usePrioritySchema = () => {
  const t = useTranslations('admin.requestPriorityType.form.validation');
  return createPrioritySchema((key: string) => t(key as any));
};

/**
 * Creates a priority schema with internationalized error messages
 */
export function createPrioritySchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(100, { message: t('nameMaxLength') }),
    primaryColor: z.string().min(1, { message: t('colorRequired') }),
    description: z
      .string()
      .max(500, { message: t('descriptionMaxLength') })
      .optional()
      .default(''),
    level: z
      .number()
      .min(0, { message: t('levelMin') })
      .max(10, { message: t('levelMax') })
      .default(0),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  });
}

/**
 * Type inference for PrioritySchema
 */
export type TPrioritySchema = z.infer<ReturnType<typeof createPrioritySchema>>;
