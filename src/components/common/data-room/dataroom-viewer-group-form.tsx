'use client';

import React, { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertDataroomViewerGroup } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

// Define the schema for form validation
const formSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').default(''),
});

export const getDefaultValues = () => ({
  id: generateUuid(),
  name: '',
});

export type DataroomViewerGroupFormValues = z.infer<typeof formSchema>;

interface DataroomViewerGroupFormProps {
  tenantId: string;
  dataroomId: string;
  initialValues?: DataroomViewerGroupFormValues | null;
}

export const DataroomViewerGroupForm: React.FC<DataroomViewerGroupFormProps> = ({ initialValues, tenantId, dataroomId }) => {
  const t = useTranslations('admin.dataroom.viewerGroup');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertDataroomViewerGroup();

  const form = useForm<DataroomViewerGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const onSubmit = (result: DataroomViewerGroupFormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: { tenantId, dataroomId, name: result.name, domains: '' },
        update: { name: result.name },
        where: { id: result.id },
      });

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]/viewers', params: { tenantId, slug: dataroomId } });
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
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('create')} />
      </FormRoot>
    </Form>
  );
};
