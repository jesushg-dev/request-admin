'use client';

import { FC, useTransition } from 'react';
import { CreateForm } from '@/actions/form';
import { useRouter } from '@/i18n/routing';
import { getDefaultFormValues, useFormSchema, type TFormSchema } from '@/services/schemas/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { FormActions, FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

import { Switch } from '../ui/switch';

const CreateNewForm: FC = () => {
  const t = useTranslations('component.form');
  const router = useRouter();
  const { tenantId } = useTenantContext();
  const [isPending, startTransition] = useTransition();

  const formSchema = useFormSchema();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultFormValues(),
    mode: 'onBlur',
  });

  const onSubmit = (values: TFormSchema) => {
    startTransition(async () => {
      const promise = CreateForm(values, tenantId);

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: (slug) => {
          router.push({ pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId, slug } });
          return t('successDescription');
        },
        error: () => {
          toast.error(t('errorTitle'), { description: t('errorDescription') });
          return t('errorTitle');
        },
      });
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
          <FormSection>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem label={t('formNameLabel')} description={t('formNameDescription')}>
                  <Input id="name" {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('formDescriptionLabel')} description={t('formDescriptionDescription')}>
                  <Textarea id="description" rows={5} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormCheckboxItem label={t('isPublicFormLabel')} description={t('isPublicFormDescription')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={t('saveButton')} />
      </FormRoot>
    </Form>
  );
};

export default CreateNewForm;
