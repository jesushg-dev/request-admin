import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(4),
  description: z.string().optional(),
});

export const keysSchema = z.record(z.string(), z.string());

export type keysSchemaType = z.infer<typeof keysSchema>;
export type formSchemaType = z.infer<typeof formSchema>;
