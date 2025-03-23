'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useFindManyRequirementType, useUpsertRequirement } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/custom-ui/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

const formSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').default(''),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less').default(''),
  isRequiredOnlyOnce: z.boolean().default(false),
  isActive: z.boolean().default(true),
  requirementType: z.object({
    label: z.string(),
    value: z.string().nonempty('This field is required.'),
  }),
});

export type RequirementFormValues = z.infer<typeof formSchema>;

export const getDefaultValues = (): RequirementFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isRequiredOnlyOnce: false,
  isActive: true,
  requirementType: { label: '', value: '' },
});

interface RequirementFormProps {
  tenantId: string;
  initialValues?: RequirementFormValues | null;
}

export function RequirementForm({ tenantId, initialValues }: RequirementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: requirementTypes, isLoading: isLoadingTypes } = useFindManyRequirementType();
  const { mutateAsync: upsert, error } = useUpsertRequirement();

  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const requirementTypeOptions =
    requirementTypes?.map((requirementType) => ({
      label: requirementType.name,
      value: requirementType.id,
    })) ?? [];

  const onSubmit = (result: RequirementFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: {
          tenantId,
          name: result.name,
          description: result.description,
          requirementTypeId: result.requirementType.value,
          isRequiredOnlyOnce: result.isRequiredOnlyOnce,
          isActive: result.isActive,
        },
        update: {
          tenantId,
          name: result.name,
          description: result.description,
          requirementTypeId: result.requirementType.value,
          isRequiredOnlyOnce: result.isRequiredOnlyOnce,
          isActive: result.isActive,
        },
        where: { id: result.id },
      });

      toast.promise(promise, {
        loading: 'Saving changes...',
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/requests-portal/requirements', params: { tenantId } });
          return `Requirement "${response?.name}" saved successfully.`;
        },
        error: (error) => `Failed to save requirement: ${error.message}`,
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            {error && <PrismaErrorAlert error={error} />}
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
                    <Textarea placeholder="Requirement description" {...field} />
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
                    <Select menuPortalTarget={null} isLoading={isLoadingTypes} isSearchable isClearable options={requirementTypeOptions} onChange={field.onChange} value={field.value} />
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
                <FormItem className="flex flex-row items-start space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="leading-none space-y-1">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Enable this option to make the requirement active.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isRequiredOnlyOnce"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="leading-none space-y-1">
                    <FormLabel>Mark as one-time required requirement</FormLabel>
                    <FormDescription>Enable this when the requirement should only be validated once.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {initialValues ? 'Update' : 'Create'} {isPending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
