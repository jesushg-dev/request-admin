'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getPathname } from '@/i18n/routing';
import { useUpsertDataroomFolder } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Locale, useTranslations } from 'next-intl';
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

export type FolderFormValues = z.infer<typeof formSchema>;

interface FolderFormProps {
  tenantId: string;
  dataroomId: string;
  currentFolderId?: string;
  callbackUrl?: string | null;
  initialValues?: FolderFormValues;
  folders: { id: string; path: string }[];
  locale: Locale;
}

export const FolderForm: React.FC<FolderFormProps> = ({ locale, initialValues, callbackUrl, dataroomId, tenantId, currentFolderId, folders }) => {
  const t = useTranslations('admin.folder.create');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsertDataRoom, error } = useUpsertDataroomFolder();

  const form = useForm<FolderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const onSubmit = (result: FolderFormValues) => {
    startTransition(async () => {
      const location = currentFolderId ? folders.find((f) => f.id === currentFolderId)?.path || 'Root' : 'Root';

      const promise = upsertDataRoom({
        create: {
          tenantId,
          dataroomId,
          name: result.name,
          parentId: currentFolderId,
          path: location + `/${result.name}`,
        },
        update: {
          dataroomId,
          name: result.name,
          parentId: currentFolderId,
          path: location + `/${result.name}`,
        },
        where: { id: result.id },
      });

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: () => {
          const pathname = callbackUrl ? callbackUrl : getPathname({ locale, href: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms/[slug]', params: { tenantId, slug: dataroomId } } });
          router.push(pathname);

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
                  <Input id="folder-name" placeholder={t('namePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormItem label={t('location')} description={t('locationDescription')}>
              <div className="text-sm">{currentFolderId ? folders.find((f) => f.id === currentFolderId)?.path || t('root') : t('root')}</div>
            </FormItem>
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('create')} />
      </FormRoot>
    </Form>
  );
};
