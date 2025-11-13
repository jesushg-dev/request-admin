import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useManageEventSchema = () => {
  const t = useTranslations('component.calendar.manageEventDialog.validation');
  return createManageEventSchema((key: string) => t(key as any));
};

/**
 * Creates a manage event schema with internationalized error messages
 */
export function createManageEventSchema(t: TranslationFn) {
  return z
    .object({
      title: z.string().min(1, { message: t('titleRequired') }),
      start: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: t('invalidStartDate'),
      }),
      end: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: t('invalidEndDate'),
      }),
      color: z.string(),
    })
    .refine(
      (data) => {
        try {
          const start = new Date(data.start);
          const end = new Date(data.end);
          return end >= start;
        } catch {
          return false;
        }
      },
      {
        message: t('endAfterStart'),
        path: ['end'],
      }
    );
}

/**
 * Type inference for ManageEventSchema
 */
export type TManageEventSchema = z.infer<ReturnType<typeof createManageEventSchema>>;

