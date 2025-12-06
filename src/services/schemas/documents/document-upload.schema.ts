import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any, values?: Record<string, any>) => string;

/**
 * Hook for use in client components
 */
export const useDocumentUploadSchema = (expectedFileType?: string | null) => {
  const t = useTranslations('admin.upload.validation');
  const translationFn: TranslationFn = (key: string, values?: Record<string, any>) => {
    return (t as any)(key, values);
  };
  return createDocumentUploadSchema(translationFn, expectedFileType);
};

/**
 * Creates a document upload schema with internationalized error messages
 */
export function createDocumentUploadSchema(t: TranslationFn, expectedFileType?: string | null) {
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
          // Validate file size
          if (file.size > 4 * 1024 * 1024) {
            ctx.addIssue({
              path: ['files'],
              message: t('fileSizeExceeded').replace('{fileName}', file.name),
              code: 'custom',
            });
          }

          // Validate file type if expected type is provided (for version uploads)
          if (expectedFileType) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (fileExtension !== expectedFileType.toLowerCase()) {
              ctx.addIssue({
                path: ['files'],
                message: t('fileTypeMismatch', {
                  expected: expectedFileType.toUpperCase(),
                  actual: (fileExtension || 'unknown').toUpperCase(),
                }),
                code: 'custom',
              });
            }
          }
        }
      }),
  });
}

/**
 * Type inference for DocumentUploadSchema
 */
export type TDocumentUploadSchema = z.infer<ReturnType<typeof createDocumentUploadSchema>>;
