import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { optionSchema } from '@/components/custom-ui/select';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useAssignRequestSchema = () => {
  const t = useTranslations('admin.request.assign.validation');
  return createAssignRequestSchema((key: string) => t(key as any));
};

/**
 * Creates an assign request schema with internationalized error messages
 */
export function createAssignRequestSchema(t: TranslationFn) {
  return z
    .object({
      assignees: z
        .array(
          z.object({
            user: optionSchema,
            isCoordinator: z.boolean(),
          })
        )
        .min(1, { message: t('assigneesMin') }),
      comments: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const coordinatorCount = data.assignees.filter((a) => a.isCoordinator).length;
      if (coordinatorCount > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('onlyOneCoordinator'),
          path: ['assignees'],
        });
      }
      if (coordinatorCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('atLeastOneCoordinator'),
          path: ['assignees'],
        });
      }
    });
}

/**
 * Type inference for AssignRequestSchema
 */
export type TAssignRequestSchema = z.infer<ReturnType<typeof createAssignRequestSchema>>;
