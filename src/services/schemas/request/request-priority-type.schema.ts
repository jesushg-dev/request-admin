import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

const MAX_PRIORITY_TYPES = 5;

/**
 * Hook for use in client components
 */
export const useRequestPriorityTypeSchema = () => {
  const t = useTranslations('admin.requestPriorityType.form.validation');
  return createRequestPriorityTypeSchema((key: string) => t(key as any));
};

/**
 * Creates a request priority type schema with internationalized error messages
 */
export function createRequestPriorityTypeSchema(t: TranslationFn) {
  const requestPriorityTypeSchema = z.object({
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(100, { message: t('nameMaxLength') }),
    description: z
      .string()
      .max(255, { message: t('descriptionMaxLength') })
      .optional(),
    isActive: z.boolean().default(true),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: t('colorInvalid') }),
  });

  return z.object({
    priorityTypes: z.array(requestPriorityTypeSchema).max(MAX_PRIORITY_TYPES, { message: t('maxPriorityTypes') }),
  });
}

/**
 * Type inference for RequestPriorityTypeSchema
 */
export type TRequestPriorityTypeSchema = z.infer<ReturnType<typeof createRequestPriorityTypeSchema>>;
