import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useNewEventSchema = () => {
  const t = useTranslations('component.calendar.newEventDialog.validation');
  return createNewEventSchema((key: string) => t(key as any));
};

/**
 * Creates a new event schema with internationalized error messages
 */
export function createNewEventSchema(t: TranslationFn) {
  return z
    .object({
      title: z.string().min(1, { message: t('titleRequired') }),
      start: z.iso.datetime(),
      end: z.iso.datetime(),
      color: z.string(),
    })
    .refine(
      (data) => {
        const start = new Date(data.start);
        const end = new Date(data.end);
        return end >= start;
      },
      {
        message: t('endAfterStart'),
        path: ['end'],
      }
    );
}

/**
 * Type inference for NewEventSchema
 */
export type TNewEventSchema = z.infer<ReturnType<typeof createNewEventSchema>>;

