'use client';

import React, { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertAgreement } from '@/services/api/hooks';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

// Define the schema for form validation
const formSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').default(''),
  description: z.string().max(500, 'Description must be 500 characters or less').default('').nullish(),
  content: z.string().min(1, 'Content is required').max(500, 'Content must be 500 characters or less').default(''),
  requireName: z.boolean().default(true),
});

export const getDefaultValues = () => ({
  id: generateUuid(),
  name: '',
  description: '',
  content: '',
  requireName: true,
});

export type AgreementFormValues = z.infer<typeof formSchema>;

interface AgreementFormProps {
  tenantId: string;
  initialValues?: AgreementFormValues | null;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({ initialValues, tenantId }) => {
  const t = useTranslations('admin.agreement');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertAgreement();

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(formSchema),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        {error && <PrismaErrorAlert error={error} />}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('form.nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('form.descriptionPlaceholder')} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>{t('form.descriptionDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.content')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('form.contentPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('form.contentDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requireName"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="leading-none space-y-1">
                    <FormLabel>{t('form.requireName')}</FormLabel>
                    <FormDescription>{t('form.requireNameDescription')}</FormDescription>
                  </div>
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
