import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useDocumentUploadSchema = () => {
  const t = useTranslations('admin.upload.validation');
  return createDocumentUploadSchema((key: string) => t(key as any));
};

/**
 * Creates a document upload schema with internationalized error messages
 */
export function createDocumentUploadSchema(t: TranslationFn) {
  return z.object({
    files: z
      .array(z.instanceof(File))
      .min(1, {
        message: t('filesRequired'),
      })
      .max(3, {
        message: t('filesMaxCount'),
      })
      .superRefine((val, ctx) => {
        const files = val as File[];
        for (const file of files) {
          if (file.size > 4 * 1024 * 1024) {
            ctx.addIssue({
              path: ['files'],
              message: t('fileSizeExceeded').replace('{fileName}', file.name),
              code: 'custom',
            });
          }
        }
      }),
  });
}

/**
 * Type inference for DocumentUploadSchema
 */
export type TDocumentUploadSchema = z.infer<ReturnType<typeof createDocumentUploadSchema>>;

