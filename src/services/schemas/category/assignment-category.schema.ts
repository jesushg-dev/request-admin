import { z } from 'zod';
import { useTranslations } from 'next-intl';

// Type helper for translation function
type TranslationFn = (key: any) => string;

/**
 * Creates an assignment category schema with internationalized error messages
 */
export function createAssignmentCategorySchema(t: TranslationFn): z.ZodType<any> {
  const assignmentCategoryFormSchema: z.ZodType<any> = z.object({
    id: z.string(),
    name: z.string().min(2, { message: t('nameMinLength') }),
    description: z.string().optional(),
    isSubCategoryVisible: z.boolean().optional(),
    hierarchyLevelId: z.string(),
    isActive: z.boolean(),
    subcategories: z
      .lazy(() => z.array(assignmentCategoryFormSchema))
      .superRefine((categories, ctx) => {
        const seen = new Set<string>();
        categories.forEach((category, index) => {
          if (seen.has(category.name)) {
            ctx.addIssue({
              path: [index, 'name'],
              code: z.ZodIssueCode.custom,
              message: t('duplicateName'),
            });
          } else {
            seen.add(category.name);
          }
        });
      }),
  });

  return assignmentCategoryFormSchema;
}

/**
 * Hook for use in client components
 */
export function useCategoriesSchema() {
  const t = useTranslations('admin.area.create.assignmentCategory.validation');
  const assignmentCategorySchema = createAssignmentCategorySchema((key: string) => t(key as any));
  
  return z.object({
    categories: z.array(assignmentCategorySchema).superRefine((categories, ctx) => {
      const seen = new Set<string>();
      categories.forEach((category, index) => {
        if (seen.has(category.name)) {
          ctx.addIssue({
            path: [index, 'name'],
            code: z.ZodIssueCode.custom,
            message: t('duplicateName'),
          });
        } else {
          seen.add(category.name);
        }
      });
    }),
  });
}

/**
 * Creates a categories schema with internationalized error messages
 */
export function createCategoriesSchema(t: TranslationFn) {
  const assignmentCategorySchema = createAssignmentCategorySchema(t);
  
  return z.object({
    categories: z.array(assignmentCategorySchema).superRefine((categories, ctx) => {
      const seen = new Set<string>();
      categories.forEach((category, index) => {
        if (seen.has(category.name)) {
          ctx.addIssue({
            path: [index, 'name'],
            code: z.ZodIssueCode.custom,
            message: t('duplicateName'),
          });
        } else {
          seen.add(category.name);
        }
      });
    }),
  });
}

/**
 * Type inference for CategoriesSchema
 */
export type TCategoriesSchema = z.infer<ReturnType<typeof createCategoriesSchema>>;

/**
 * Get schema for use in stepper (without internationalization)
 */
export function getCategoriesSchema() {
  return createCategoriesSchema((key: string) => key);
}

