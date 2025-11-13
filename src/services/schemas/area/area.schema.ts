import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useAreaSchema() {
  const t = useTranslations('admin.area.create.form.validation');
  return createAreaSchema((key: string) => t(key as any));
}

/**
 * Creates an area schema with internationalized error messages
 */
export function createAreaSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    name: z.string().min(1, { message: t('nameRequired') }),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    hierarchyId: optionSchema,
  });
}

/**
 * Type inference for AreaSchema
 */
export type TAreaSchema = z.infer<ReturnType<typeof createAreaSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getAreaSchema() {
  return createAreaSchema((key: string) => key);
}

