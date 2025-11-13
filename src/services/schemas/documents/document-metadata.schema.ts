import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useDocumentMetadataSchema = () => {
  const t = useTranslations('admin.document.metaform.validation');
  return createDocumentMetadataSchema((key: string) => t(key as any));
};

/**
 * Creates a document metadata schema with internationalized error messages
 */
export function createDocumentMetadataSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    name: z.string().min(1, { message: t('nameRequired') }).max(200, { message: t('nameMaxLength') }),
    description: z.string().nullish(),
    status: z.string().refine((val) => ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(val), {
      message: t('statusInvalid'),
    }),
    expirationDate: z.date().nullish(),
    assistantEnabled: z.boolean(),
    advancedExcelEnabled: z.boolean(),
    downloadOnly: z.boolean(),
  });
}

/**
 * Type inference for DocumentMetadataSchema
 */
export type TDocumentMetadataSchema = z.infer<ReturnType<typeof createDocumentMetadataSchema>>;

