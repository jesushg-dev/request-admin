'use client';

import React, { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertDataroom } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

// Define the schema for form validation
const formSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').default(''),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less').default(''),
});

export const getDefaultValues = () => ({
  id: generateUuid(),
  name: '',
  slug: '',
  description: '',
});

export type DataroomFormValues = z.infer<typeof formSchema>;

interface DataroomFormProps {
  tenantId: string;
  initialValues?: DataroomFormValues | null;
}

export const DataroomForm: React.FC<DataroomFormProps> = ({ initialValues, tenantId }) => {
  const t = useTranslations('admin.dataroom.create');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertDataroom();

  const form = useForm<DataroomFormValues>({
    resolver: zodResolver(formSchema),
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
                    <Input id="name" placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('slug')}</FormLabel>
                  <FormControl>
                    <Input id="slug" placeholder={t('slugPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('slugDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea id="description" placeholder={t('descriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('descriptionDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
