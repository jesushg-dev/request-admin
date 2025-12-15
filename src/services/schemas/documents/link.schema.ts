import { useTranslations } from 'next-intl';
import { z } from 'zod';

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
      name: z
        .string()
        .min(1, { message: t('nameRequired') })
        .max(200, { message: t('nameMaxLength') }),
      expiresAt: z.date().optional(),
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
      feedbackQuestion: z
        .object({
          type: z.enum(['YES_NO', 'TEXT', 'RATING']),
          question: z.string(),
        })
        .optional(),
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
      // Password validation
      if (data.enablePassword && !data.password) {
        ctx.addIssue({
          code: 'custom',
          message: t('passwordRequiredWhenEnabled'),
          path: ['password'],
        });
      }

      // Agreement validation
      if (data.enableAgreement && !data.agreementId) {
        ctx.addIssue({
          code: 'custom',
          message: t('agreementRequiredWhenEnabled'),
          path: ['agreementId'],
        });
      }

      // Allow specific viewers validation
      if (data.allowSpecificViewers && data.allowedViewers.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: t('allowedViewersRequiredWhenEnabled'),
          path: ['allowedViewers'],
        });
      }

      // Block specific viewers validation
      if (data.blockSpecificViewers && data.denyViewers.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: t('denyViewersRequiredWhenEnabled'),
          path: ['denyViewers'],
        });
      }

      // Feedback question validation
      if (data.enableFeedback && (!data.feedbackQuestion || !data.feedbackQuestion.question || data.feedbackQuestion.question.trim().length < 3)) {
        ctx.addIssue({
          code: 'custom',
          message: t('feedbackQuestionRequiredWhenEnabled'),
          path: ['feedbackQuestion'],
        });
      }
    });
}

/**
 * Type inference for LinkSchema
 */
export type TLinkSchema = z.infer<ReturnType<typeof createLinkSchema>>;
