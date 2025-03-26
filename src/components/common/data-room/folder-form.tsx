'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getPathname } from '@/i18n/routing';
import { useUpsertDataroomFolder } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { Locale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        {error && <PrismaErrorAlert error={error} />}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input id="folder-name" placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>{t('location')}</FormLabel>
              <FormControl>
                <div className="text-sm">{currentFolderId ? folders.find((f) => f.id === currentFolderId)?.path || 'Root' : 'Root'}</div>
              </FormControl>
              <FormDescription>{t('locationDescription')}</FormDescription>
            </FormItem>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {initialValues ? t('saveChanges') : t('create')} {isPending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
};
