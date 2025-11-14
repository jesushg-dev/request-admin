import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useCreateRequestTypeSchema() {
  const t = useTranslations('admin.requestType.create.validation');
  return createCreateRequestTypeSchema((key: string) => t(key as any));
}

/**
 * Creates a create request type schema with internationalized error messages
 */
export function createCreateRequestTypeSchema(t: TranslationFn) {
  return z.object({
    hierarchyId: optionSchema,
    parentCategoryName: z.string().min(1, { message: t('nameMinLength') }),
  });
}

/**
 * Type inference for CreateRequestTypeSchema
 */
export type TCreateRequestTypeSchema = z.infer<ReturnType<typeof createCreateRequestTypeSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getCreateRequestTypeSchema() {
  return createCreateRequestTypeSchema((key: string) => key);
}

