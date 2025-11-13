import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { optionSchema } from '@/components/custom-ui/select';
import { executionFlowSchema } from '@/services/schemas/execution-flow';
import { useGuideSchema } from './guide.schema';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useRequestCategorySchema = () => {
  const t = useTranslations('admin.requestType.create.validation');
  const guideSchema = useGuideSchema();
  return createRequestCategorySchema((key: string) => t(key as any), guideSchema);
};

/**
 * Creates a request category schema with internationalized error messages
 */
export function createRequestCategorySchema(t: TranslationFn, guideSchema: ReturnType<typeof useGuideSchema>) {
  return z.object({
    id: z.string(),
    hierarchyLevelId: z.string(),
    parentCategoryId: z.string().nullish(),
    name: z.string().min(2, { message: t('nameMinLength') }).max(100, { message: t('nameMaxLength') }),
    description: z.string().nullish(),
    isActive: z.boolean().default(true),
    isEligibleForNewClients: z.boolean().default(true),
    requirements: z.array(optionSchema).optional(),
    forms: z.array(optionSchema).optional(),
    sla: z.object({
      id: z.string(),
      resolutionTime: z.coerce.number().min(0, { message: t('sla.resolutionTimeMin') }),
      escalationTime: z.coerce.number().min(0, { message: t('sla.escalationTimeMin') }),
    }),
    guides: z.array(guideSchema),
    children: z.array(z.string()),
    executionSteps: executionFlowSchema.optional(),
  });
}

/**
 * Type inference for RequestCategorySchema
 */
export type TRequestCategorySchema = z.infer<ReturnType<typeof createRequestCategorySchema>>;

