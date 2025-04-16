import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const MAX_PRIORITY_TYPES = 5;

const requestPriorityTypeSchema = z.object({
  name: z.string().min(1, 'Required').max(100, 'Max 100 chars'),
  description: z.string().max(255, 'Max 255 chars').optional(),
  isActive: z.boolean().default(true),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color'),
});

const formSchema = z.object({
  priorityTypes: z.array(requestPriorityTypeSchema).max(MAX_PRIORITY_TYPES, `Maximum of ${MAX_PRIORITY_TYPES} priority types allowed`),
});

type FormValues = z.infer<typeof formSchema>;

export default function RequestPriorityTypeForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priorityTypes: [{ name: '', description: '', isActive: true, primaryColor: '#000000' }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'priorityTypes',
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // Here you would typically send the data to your API
  };

  const moveUp = (index: number) => {
    if (index > 0) move(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < fields.length - 1) move(index, index + 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-md">
            <div className="col-span-1 text-sm font-medium text-gray-500">Priority {fields.length - index}</div>
            <FormField
              control={form.control}
              name={`priorityTypes.${index}.name`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormControl>
                    <Input {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`priorityTypes.${index}.description`}
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormControl>
                    <Input {...field} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`priorityTypes.${index}.isActive`}
              render={({ field }) => (
                <FormItem className="col-span-2 flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id={`isActive-${index}`} />
                  </FormControl>
                  <FormLabel htmlFor={`isActive-${index}`} className="text-sm font-normal cursor-pointer">
                    Active
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`priorityTypes.${index}.primaryColor`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input {...field} type="color" className="w-8 h-8 p-0 border-none" />
                      <Input {...field} placeholder="#000000" className="flex-grow" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2 flex justify-end space-x-1">
              <Button type="button" variant="outline" size="icon" onClick={() => moveUp(index)} disabled={index === 0}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => moveDown(index)} disabled={index === fields.length - 1}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', description: '', isActive: true, primaryColor: '#000000' })}
            disabled={fields.length >= MAX_PRIORITY_TYPES}>
            <Plus className="mr-2 h-4 w-4" />
            Add Priority Type
          </Button>
          <Button type="submit">Submit</Button>
        </div>
        {fields.length >= MAX_PRIORITY_TYPES && (
          <Alert variant="warning">
            <AlertDescription>Maximum number of priority types reached ({MAX_PRIORITY_TYPES}).</AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
}
