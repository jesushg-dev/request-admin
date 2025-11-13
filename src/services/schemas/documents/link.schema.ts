import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useLinkSchema = () => {
  const t = useTranslations('admin.link.form.validation');
  return createLinkSchema((key: string) => t(key as any));
};

/**
 * Creates a link form schema with internationalized error messages
 */
export function createLinkSchema(t: TranslationFn) {
  return z
    .object({
      id: z.string(),
      name: z.string().min(1, { message: t('nameRequired') }).max(200, { message: t('nameMaxLength') }),
      expirationDate: z.date().optional(),
      enablePassword: z.boolean(),
      password: z.string().optional(),
      emailProtected: z.boolean(),
      emailAuthenticated: z.boolean(),
      enableScreenshotProtection: z.boolean(),
      enableWatermark: z.boolean(),
      enableAgreement: z.boolean(),
      agreementId: z.string().optional(),
      allowDownload: z.boolean(),
      enableNotification: z.boolean(),
      enableFeedback: z.boolean(),
      enableQuestion: z.boolean(),
      allowSpecificViewers: z.boolean(),
      allowedViewers: z.array(
        z.object({
          value: z.string().min(1, { message: t('viewerValueRequired') }),
          type: z.enum(['EMAIL', 'DOMAIN']),
        })
      ),
      blockSpecificViewers: z.boolean(),
      denyViewers: z.array(
        z.object({
          value: z.string().min(1, { message: t('viewerValueRequired') }),
          type: z.enum(['EMAIL', 'DOMAIN']),
        })
      ),
      customFields: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string().min(1, { message: t('customFieldLabelRequired') }),
          placeholder: z.string().optional(),
          description: z.string().optional(),
          required: z.boolean(),
          disabled: z.boolean(),
        })
      ),
    })
    .superRefine((data, ctx) => {
      if (data.enablePassword && !data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('passwordRequiredWhenEnabled'),
          path: ['password'],
        });
      }
    });
}

/**
 * Type inference for LinkSchema
 */
export type TLinkSchema = z.infer<ReturnType<typeof createLinkSchema>>;

