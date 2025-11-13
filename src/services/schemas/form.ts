import { z } from 'zod';

// Re-export from new schema structure
export { useFormSchema, createFormSchema, getDefaultFormValues, type TFormSchema } from './form/form.schema';

// Legacy exports for backward compatibility
export type formSchemaType = import('./form/form.schema').TFormSchema;

// Keep keysSchema for backward compatibility
export const keysSchema = z.record(z.string(), z.string());
export type keysSchemaType = z.infer<typeof keysSchema>;
