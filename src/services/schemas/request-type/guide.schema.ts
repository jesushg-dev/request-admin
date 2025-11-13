import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useGuideSchema = () => {
  const t = useTranslations('admin.requestType.create.guidesTab.validation');
  return createGuideSchema((key: string) => t(key as any));
};

/**
 * Creates a guide schema with internationalized error messages
 */
export function createGuideSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    name: z.string().min(2, { message: t('nameMinLength') }),
    description: z.string().nullish(),
    fileType: z.enum(['PDF', 'Excel', 'Video', 'DOCX', 'XLSX']),
    fileUrl: z.string().url({ message: t('fileUrlInvalid') }),
    version: z.string().min(1, { message: t('versionRequired') }),
    updatedAt: z.string().min(1, { message: t('updatedAtRequired') }),
    isActive: z.boolean().default(true),
  });
}

/**
 * Type inference for GuideSchema
 */
export type TGuideSchema = z.infer<ReturnType<typeof createGuideSchema>>;

