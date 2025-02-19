import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';

export interface Module {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface ModulesFormProps {
  modules: Module[];
}

export const modulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      isActive: z.boolean(),
    })
  ),
});

export type ModulesValues = z.infer<typeof modulesSchema>;

export function ModulesStep({ modules }: ModulesFormProps) {
  const { control } = useFormContext<ModulesValues>();

  return (
    <div className="m-1 flex flex-col gap-2">
      {modules.map((module, index) => (
        <FormField
          key={module.id}
          control={control}
          name={`modules.${index}.isActive`}
          render={({ field }) => (
            <FormItem className="mx-1 flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{module.name}</FormLabel>
                {module.description && <FormDescription className="text-muted-foreground text-sm">{module.description}</FormDescription>}
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
