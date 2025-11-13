import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useDataroomSchema = () => {
  const t = useTranslations('admin.dataroom.create.validation');
  return createDataroomSchema((key: string) => t(key as any));
};

/**
 * Creates a dataroom schema with internationalized error messages
 */
export function createDataroomSchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string().min(1, { message: t('nameRequired') }).max(200, { message: t('nameMaxLength') }),
    description: z.string().min(1, { message: t('descriptionRequired') }).max(500, { message: t('descriptionMaxLength') }),
  });
}

/**
 * Type inference for DataroomSchema
 */
export type TDataroomSchema = z.infer<ReturnType<typeof createDataroomSchema>>;

