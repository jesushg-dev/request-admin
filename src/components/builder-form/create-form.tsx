'use client';

import { FC } from 'react';
import { CreateForm } from '@/actions/form';
import { useRouter } from '@/i18n/routing';
import { formSchema, formSchemaType, getDefaultFormValues } from '@/services/schemas/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Checkbox } from '../ui/checkbox';

const CreateNewForm: FC = () => {
  const t = useTranslations('component.formBuilder');
  const router = useRouter();
  const tenantId = useTenantId();

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultFormValues(),
  });

  const handleFormSubmit = async (values: formSchemaType) => {
    try {
      const slug = await CreateForm(values, tenantId);
      toast.success(t('successTitle'), { description: t('successDescription') });
      router.push({ pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId, slug } });
    } catch {
      toast.error(t('errorTitle'), { description: t('errorDescription') });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex w-full flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('formNameLabel')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>{t('formNameDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('formDescriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormDescription>{t('formDescriptionDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('isPublicFormLabel')}</FormLabel>
                <FormDescription>{t('isPublicFormDescription')}</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-end justify-end w-full">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : t('saveButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateNewForm;
