'use client';

import { useMemo } from 'react';
import { useFindManyRequirementType } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Select from '@/components/select/select';

export interface Requirement {
  id?: string;
  name: string;
  description: string;
  isRequiredOnlyForNewClients: boolean;
  requirementType: {
    label: string;
    value: string;
  };
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  isRequiredOnlyForNewClients: z.boolean(),
  requirementType: z.object({
    label: z.string(),
    value: z.string().nonempty('This field is required.'),
  }),
});

export function RequirementForm() {
  const { data: requirementTypes, isLoading } = useFindManyRequirementType();
  const requirementTypeOptions = useMemo(() => {
    return requirementTypes?.map((requirementType) => ({
      label: requirementType.name,
      value: requirementType.id,
    }));
  }, [requirementTypes]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isRequiredOnlyForNewClients: false,
      requirementType: { label: '', value: '' },
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('🚀 ~ handleSubmit ~ data:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between overflow-hidden p-6 pt-0">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Requirement name" {...field} />
              </FormControl>
              <FormDescription>The name of the requirement.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Requirement description" {...field} />
              </FormControl>
              <FormDescription>The description of the requirement.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirementType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Type</FormLabel>
              <FormControl>
                <Select isLoading={isLoading} isSearchable isClearable options={requirementTypeOptions} onChange={field.onChange} value={field.value} />
              </FormControl>
              <FormDescription>The type of the requirement.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRequiredOnlyForNewClients"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Required only for new clients</FormLabel>
                <FormDescription>Check this if the requirement applies only to new clients.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
