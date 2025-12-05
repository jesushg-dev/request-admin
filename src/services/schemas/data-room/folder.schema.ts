import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useFolderSchema = () => {
  const t = useTranslations('admin.folder.create.validation');
  return createFolderSchema((key: string) => t(key as any));
};

/**
 * Creates a folder schema with internationalized error messages
 */
export function createFolderSchema(t: TranslationFn) {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string()
      .min(1, { message: t('nameRequired') })
      .max(200, { message: t('nameMaxLength') }),
  });
}

/**
 * Type inference for FolderSchema
 */
export type TFolderSchema = z.infer<ReturnType<typeof createFolderSchema>>;
