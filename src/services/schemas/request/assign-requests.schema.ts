import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useAssignRequestsSchema = () => {
  const t = useTranslations('admin.request.massiveAssign.validation');
  return createAssignRequestsSchema((key: string) => t(key as any));
};

/**
 * Creates an assign requests schema with internationalized error messages
 */
export function createAssignRequestsSchema(t: TranslationFn) {
  return z.object({
    userId: optionSchema,
    requestIds: z
      .array(
        z.object({
          requestId: optionSchema,
        })
      )
      .min(1, { message: t('requestRequired') }),
    comments: z.string().optional(),
  });
}

/**
 * Type inference for AssignRequestsSchema
 */
export type TAssignRequestsSchema = z.infer<ReturnType<typeof createAssignRequestsSchema>>;

