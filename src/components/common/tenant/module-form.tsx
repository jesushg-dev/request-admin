import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';

import { Module, ModulesData } from './types';

interface ModulesFormProps {
  modules: Module[];
}

export function ModulesForm({ modules }: ModulesFormProps) {
  const { control } = useFormContext<ModulesData>();

  return (
    <div className="space-y-4">
      {modules.map((module, index) => (
        <FormField
          key={module.id}
          control={control}
          name={`modules.${index}.isActive`}
          render={({ field }) => (
            <FormItem className="mx-1 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{module.name}</FormLabel>
                {module.description && <FormDescription className="text-sm text-muted-foreground">{module.description}</FormDescription>}
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
