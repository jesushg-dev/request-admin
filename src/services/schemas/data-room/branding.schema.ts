import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useDataroomBrandingSchema = () => {
  const t = useTranslations('admin.dataroom.branding.validation');
  return createDataroomBrandingSchema((key: string) => t(key as any));
};

/**
 * Creates a dataroom branding schema with internationalized error messages
 */
export function createDataroomBrandingSchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    dataroomId: z.string(),
    logo: z
      .string()
      .url({ message: t('logoInvalidUrl') })
      .nullable(),
    banner: z
      .string()
      .url({ message: t('bannerInvalidUrl') })
      .nullable(),
    brandColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: t('brandColorInvalid') })
      .nullable(),
    accentColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: t('accentColorInvalid') })
      .nullable(),
  });
}

/**
 * Type inference for DataroomBrandingSchema
 */
export type TDataroomBrandingSchema = z.infer<ReturnType<typeof createDataroomBrandingSchema>>;
