'use client';

import { useTransition } from 'react';
import { CreateRequirementType, UpdateRequirementType } from '@/actions/requirementType';
import { useRouter } from '@/i18n/routing';
import { useRequirementTypeSchema, type TRequirementTypeSchema } from '@/services/schemas/requirement';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { generateUuid } from '@/lib/id';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormActions, FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export type RequirementTypeFormValues = TRequirementTypeSchema;

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
  const formSchema = useRequirementTypeSchema();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const onSubmit = (values: RequirementTypeFormValues) => {
    startTransition(async () => {
      try {
        const formData = {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        };

        let result;

        if (initialValues) {
          // Update existing requirement type
          result = await UpdateRequirementType(values.id, formData, tenantId);
        } else {
          // Create new requirement type
          result = await CreateRequirementType(formData, tenantId);
        }

        toast.success(t('successSave', { name: result?.name ?? '-' }));
        router.push({ pathname: '/admin/[tenantId]/configurations/requirement-types', params: { tenantId } });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(t('errorSave', { message: errorMessage }));
      }
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
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
