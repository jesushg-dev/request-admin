import { z } from 'zod';

// Type helper for translation function (for future use)
type TranslationFn = (key: any) => string;

/**
 * Hook for use in client components
 */
export const useAppearanceSchema = () => {
  return createAppearanceSchema();
};

/**
 * Creates an appearance schema (no validation messages needed, but keeping pattern consistent)
 * For future use: can accept TranslationFn parameter if validation messages are needed
 */
export function createAppearanceSchema(t?: TranslationFn) {
  return z.object({
    font: z.string(),
    theme: z.string(),
    language: z.string(),
  });
}

/**
 * Type inference for AppearanceSchema
 */
export type TAppearanceSchema = z.infer<ReturnType<typeof createAppearanceSchema>>;

