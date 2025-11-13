import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useFormSchema = () => {
  const t = useTranslations('component.form.validation');
  return createFormSchema((key: string) => t(key as any));
};

/**
 * Creates a form schema with internationalized error messages
 */
export function createFormSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(4, { message: t('nameMinLength') }),
    description: z.string().optional().default(''),
    isPublic: z.boolean().optional().default(false),
  });
}

/**
 * Type inference for FormSchema
 */
export type TFormSchema = z.infer<ReturnType<typeof createFormSchema>>;

/**
 * Default values generator
 */
export const getDefaultFormValues = (): TFormSchema => ({
  name: '',
  description: '',
  isPublic: false,
});

