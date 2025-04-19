'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useFindManyRequirementType, useUpsertRequirement } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/custom-ui/select';
import { FormActions, FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

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
  const t = useTranslations('admin.requirement.form');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: requirementTypes, isLoading: isLoadingTypes } = useFindManyRequirementType();
  const { mutateAsync: upsert, error } = useUpsertRequirement();

  const form = useForm({
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
        loading: t('savingChanges'),
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/configurations/requirements', params: { tenantId } });
          return t('successSave', { name: response?.name ?? '-' });
        },
        error: (error) => t('errorSave', { message: error.message }),
      });
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent error={error}>
          <FormSection>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem label={t('name')} description={t('nameDescription')}>
                  <Input placeholder={t('name')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionDescription')}>
                  <Textarea placeholder={t('description')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirementType"
              render={({ field }) => (
                <FormItem label={t('requirementType')} description={t('requirementTypeDescription')}>
                  <Select menuPortalTarget={null} isLoading={isLoadingTypes} isSearchable isClearable options={requirementTypeOptions} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormCheckboxItem label={t('isActive')} description={t('isActiveDescription')}>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRequiredOnlyOnce"
              render={({ field }) => (
                <FormCheckboxItem label={t('isRequiredOnlyOnce')} description={t('isRequiredOnlyOnceDescription')}>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('update') : t('create')} className="px-4" />
      </FormRoot>
    </Form>
  );
}
