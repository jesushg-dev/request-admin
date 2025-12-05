import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useRequestDetailSchema() {
  const t = useTranslations('admin.request.form.detailsStep.validation');
  return createRequestDetailSchema((key: string) => t(key as any));
}

/**
 * Creates a request detail schema with internationalized error messages
 */
export function createRequestDetailSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    slug: z.number().optional(),
    issueSubject: z
      .string()
      .min(1, { message: t('issueSubjectRequired') })
      .max(255, { message: t('issueSubjectMaxLength') }),
    description: z
      .string()
      .max(5000, { message: t('descriptionMaxLength') })
      .optional(),
    priorityId: z.object({ value: z.string().min(1, { message: t('priorityRequired') }), label: z.string() }),
    statusId: z.object({ value: z.string(), label: z.string() }).optional(),
    isDraft: z.boolean(),
  });
}

/**
 * Type inference for RequestDetailSchema
 */
export type TRequestDetailSchema = z.infer<ReturnType<typeof createRequestDetailSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getRequestDetailSchema() {
  return createRequestDetailSchema((key: string) => key);
}
