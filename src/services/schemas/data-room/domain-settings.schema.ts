import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useDomainSettingsSchema = () => {
  const t = useTranslations('admin.dataroom.groups.settings.validation');
  return createDomainSettingsSchema((key: string) => t(key as any));
};

/**
 * Creates a domain settings schema with internationalized error messages
 */
export function createDomainSettingsSchema(t: TranslationFn) {
  return z.object({
    allowedDomains: z.string(),
    allowAll: z.boolean(),
  });
}

/**
 * Type inference for DomainSettingsSchema
 */
export type TDomainSettingsSchema = z.infer<ReturnType<typeof createDomainSettingsSchema>>;
