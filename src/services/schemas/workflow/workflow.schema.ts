import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useWorkflowSchema() {
  const t = useTranslations('admin.workflow.form.validation');
  return createWorkflowSchema((key: string) => t(key as any));
}

/**
 * Creates a workflow schema with internationalized error messages
 */
export function createWorkflowSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    name: z.string().min(1, { message: t('nameRequired') }),
    description: z.string().optional(),
    isDefault: z.boolean().default(false),
    requireComments: z.boolean().default(false),
    notifyChanges: z.boolean().default(false),
  });
}

/**
 * Type inference for WorkflowSchema
 */
export type TWorkflowSchema = z.infer<ReturnType<typeof createWorkflowSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getWorkflowSchema() {
  return createWorkflowSchema((key: string) => key);
}

