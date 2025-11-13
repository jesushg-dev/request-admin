'use client';

import React, { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertDataroom } from '@/services/api/hooks';
import { useDataroomSchema, type TDataroomSchema } from '@/services/schemas/data-room';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { generateUuid } from '@/lib/id';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export const getDefaultValues = (): DataroomFormValues => ({
  id: generateUuid(),
  name: '',
  slug: '',
  description: '',
});

export type DataroomFormValues = TDataroomSchema;

interface DataroomFormProps {
  tenantId: string;
  initialValues?: DataroomFormValues | null;
}

export const DataroomForm: React.FC<DataroomFormProps> = ({ initialValues, tenantId }) => {
  const t = useTranslations('admin.dataroom.create');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertDataroom();

  const dataroomSchema = useDataroomSchema();

  const form = useForm<DataroomFormValues>({
    resolver: zodResolver(dataroomSchema),
    defaultValues: initialValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const onSubmit = (result: DataroomFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: {
          tenantId,
          name: result.name,
          pId: result.slug,
          description: result.description,
        },
        update: {
          name: result.name,
          pId: result.slug,
          description: result.description,
        },
        where: { id: result.id },
      });

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } });
          return t('saveSuccess');
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
                <FormItem label={t('name')} description={t('nameDescription')}>
                  <Input id="name" placeholder={t('namePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem label={t('slug')} description={t('slugDescription')}>
                  <Input id="slug" placeholder={t('slugPlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionDescription')}>
                  <Textarea id="description" placeholder={t('descriptionPlaceholder')} {...field} />
                </FormItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('create')} />
      </FormRoot>
    </Form>
  );
};
