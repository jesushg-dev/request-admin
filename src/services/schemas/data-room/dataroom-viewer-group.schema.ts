import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useDataroomViewerGroupSchema = () => {
  const t = useTranslations('admin.dataroom.viewerGroup.validation');
  return createDataroomViewerGroupSchema((key: string) => t(key as any));
};

/**
 * Creates a dataroom viewer group schema with internationalized error messages
 */
export function createDataroomViewerGroupSchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(200, { message: t('nameMaxLength') }),
  });
}

/**
 * Type inference for DataroomViewerGroupSchema
 */
export type TDataroomViewerGroupSchema = z.infer<ReturnType<typeof createDataroomViewerGroupSchema>>;
