'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRequirementType } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormActions, FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

// Schema definition for request priority type form
const formSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().default(''),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type RequirementTypeFormValues = z.infer<typeof formSchema>;

// Default values generator
export const getDefaultValues = (): RequirementTypeFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
  isDefault: false,
});

interface RequirementTypeFormProps {
  tenantId: string;
  initialValues?: RequirementTypeFormValues | null;
}

// Main component for creating or editing a request priority type
export default function RequirementTypeForm({ tenantId, initialValues }: RequirementTypeFormProps) {
  const t = useTranslations('admin.requirementType.form');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRequirementType();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const onSubmit = (values: RequirementTypeFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: {
          tenantId,
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          //isDefault: values.isDefault,
        },
        update: {
          tenantId,
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          //isDefault: values.isDefault,
        },
        where: { id: values.id },
      });

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } });
          return t('successSave', { name: response?.name ?? '-' });
        },
        error: (err) => t('errorSave', { message: err.message }),
      });
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent error={error}>
          <FormSection>
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem label={t('name')} description={t('namePlaceholder')} className="flex-1" data-testid="name">
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionPlaceholder')} data-testid="description">
                  <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                </FormItem>
              )}
            />

            {/* Active status checkbox */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormCheckboxItem label={t('isActive')} description={t('isActivePlaceholder')} data-testid="isActive">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
            {/* Default status checkbox */}

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormCheckboxItem label={t('isDefault')} description={t('isDefaultPlaceholder')} data-testid="isDefault">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>

        {/* Actions: Create or Update */}
        <FormActions isPending={isPending} title={initialValues ? t('update') : t('create')} className="px-4" />
      </FormRoot>
    </Form>
  );
}
