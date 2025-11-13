'use client';

import React, { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertAgreement } from '@/services/api/hooks';
import { useAgreementSchema, type TAgreementSchema } from '@/services/schemas/data-room';
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

export const getDefaultValues = (): AgreementFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  content: '',
  requireName: true,
});

export type AgreementFormValues = TAgreementSchema;

interface AgreementFormProps {
  tenantId: string;
  initialValues?: AgreementFormValues | null;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({ initialValues, tenantId }) => {
  const t = useTranslations('admin.agreement');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertAgreement();

  const agreementSchema = useAgreementSchema();

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementSchema),
    defaultValues: initialValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const onSubmit = (result: AgreementFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: {
          tenantId,
          name: result.name,
          description: result.description,
          content: result.content,
          requireName: result.requireName,
        },
        update: {
          name: result.name,
          description: result.description,
          content: result.content,
          requireName: result.requireName,
        },
        where: { id: result.id },
      });

      toast.promise(promise, {
        loading: t('form.savingChanges'),
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } });
          return t('form.saveSuccess');
        },
        error: (error) => t('saveError', { message: error.message }),
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
                <FormItem label={t('form.name')} description={t('form.nameDescription')}>
                  <Input placeholder={t('form.namePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('form.description')} description={t('form.descriptionDescription')}>
                  <Textarea placeholder={t('form.descriptionPlaceholder')} {...field} value={field.value ?? ''} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem label={t('form.content')} description={t('form.contentDescription')}>
                  <Textarea placeholder={t('form.contentPlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requireName"
              render={({ field }) => (
                <FormCheckboxItem label={t('form.requireName')} description={t('form.requireNameDescription')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('create')} />
      </FormRoot>
    </Form>
  );
};
