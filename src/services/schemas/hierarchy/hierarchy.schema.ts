import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export function useHierarchySchema() {
  const t = useTranslations('admin.hierarchy.hierarchyForm.validation');
  return createHierarchySchema((key: string) => t(key as any));
}

/**
 * Creates a hierarchy schema with internationalized error messages
 */
export function createHierarchySchema(t: TranslationFn) {
  return z.object({
    id: z.string(),
    name: z.string().min(1, { message: t('nameRequired') }).max(100, { message: t('nameMaxLength') }),
    description: z.string().max(255, { message: t('descriptionMaxLength') }).optional(),
    isActive: z.boolean().optional(),
  });
}

/**
 * Type inference for HierarchySchema
 */
export type THierarchySchema = z.infer<ReturnType<typeof createHierarchySchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 * This is used only for defineStepper which needs schema at module level
 * The actual validation will use the hook version with internationalization
 */
export function getHierarchySchema() {
  return createHierarchySchema((key: string) => key);
}

