import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useTenantFormSchema = () => {
  const t = useTranslations('tenants.organization.form.validation');
  return createTenantFormSchema((key: string) => t(key as any));
};

/**
 * Creates a tenant form schema with internationalized error messages
 */
export function createTenantFormSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(2, {
      message: t('name'),
    }),
    slug: z
      .string()
      .min(2, {
        message: t('slug.min'),
      })
      .regex(/^[a-z0-9-]+$/, t('slug.invalid')),
    logo: z.string().optional(),
    websiteUrl: z
      .string()
      .url({
        message: t('website'),
      })
      .optional()
      .or(z.literal('')),
    title: z.string().optional(),
    description: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    contactEmail: z
      .string()
      .email({
        message: t('email'),
      })
      .optional()
      .or(z.literal('')),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
  });
}

/**
 * Type inference for TenantFormSchema
 */
export type TTenantFormSchema = z.infer<ReturnType<typeof createTenantFormSchema>>;
