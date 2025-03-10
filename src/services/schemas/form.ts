import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(4).default(''),
  description: z.string().optional().default(''),
  isPublic: z.boolean().optional().default(false),
});

export const keysSchema = z.record(z.string(), z.string());

export type keysSchemaType = z.infer<typeof keysSchema>;
export type formSchemaType = z.infer<typeof formSchema>;

export const getDefaultFormValues = (): formSchemaType => ({
  name: '',
  description: '',
  isPublic: false,
});
