'use client';

import { useMemo } from 'react';
import { useCreateRequirement, useFindManyRequirementType, useUpdateRequirement } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import useFormSubmit from '@/hooks/use-form-submit';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Select from '@/components/select/select';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  isRequiredOnlyOnce: z.boolean(),
  isActive: z.boolean(),
  requirementType: z.object({
    label: z.string(),
    value: z.string().nonempty('This field is required.'),
  }),
});

export type RequirementFormValues = z.infer<typeof formSchema>;

interface RequirementFormProps {
  tenantId: string;
  initialValues?: (RequirementFormValues & { id: string }) | null;
}

export function RequirementForm({ tenantId, initialValues }: RequirementFormProps) {
  const { data: requirementTypes, isLoading: isLoadingTypes } = useFindManyRequirementType();

  const { mutateAsync: createRequirement } = useCreateRequirement();
  const { mutateAsync: updateRequirement } = useUpdateRequirement();

  const submitCreate = useFormSubmit(createRequirement, {
    redirectUrl: { pathname: '/admin/[tenantId]/requests-portal/requirements', params: { tenantId } },
  });
  const submitUpdate = useFormSubmit(updateRequirement, {
    redirectUrl: { pathname: '/admin/[tenantId]/requests-portal/requirements', params: { tenantId } },
  });

  const requirementTypeOptions = useMemo(() => {
    return requirementTypes?.map((requirementType) => ({
      label: requirementType.name,
      value: requirementType.id,
    }));
  }, [requirementTypes]);

  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? {},
  });

  const onSubmit = async (result: RequirementFormValues) => {
    if (initialValues?.id) {
      await submitUpdate({
        data: {
          tenantId,
          name: result.name,
          description: result.description,
          requirementTypeId: result.requirementType.value,
          isRequiredOnlyOnce: result.isRequiredOnlyOnce,
          isActive: result.isActive,
        },
        where: { id: initialValues.id },
      });
      return;
    }

    await submitCreate({
      data: { tenantId, name: result.name, description: result.description, requirementTypeId: result.requirementType.value, isRequiredOnlyOnce: result.isRequiredOnlyOnce, isActive: result.isActive },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4">
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
              <FormDescription>Clear instructions that will be shown to users fulfilling this requirement.</FormDescription>
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
                <Select isLoading={isLoadingTypes} isSearchable isClearable options={requirementTypeOptions} onChange={field.onChange} value={field.value} />
              </FormControl>
              <FormDescription>The type of the requirement.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>Enable this option to make the requirement active</FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isRequiredOnlyOnce"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mark as one-time required requirement</FormLabel>
                <FormDescription>Enable this option when the requirement should only be validated once</FormDescription>
              </div>
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end">
          <Button type="submit">{initialValues ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Form>
  );
}
