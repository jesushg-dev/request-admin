'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertDocument } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormActions, FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().nullish(),
  status: z.string().refine((val) => ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(val), {
    message: 'Invalid status',
  }),
  expirationDate: z.date().nullish(),
  assistantEnabled: z.boolean(),
  advancedExcelEnabled: z.boolean(),
  downloadOnly: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;

export const getDefaultValues = (): FormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  status: 'DRAFT',
  expirationDate: null,
  assistantEnabled: false,
  advancedExcelEnabled: false,
  downloadOnly: false,
});

interface DocumentMetadataFormProps {
  tenantId: string;
  initialValues?: FormValues;
}

export default function DocumentMetadataForm({ tenantId, initialValues }: DocumentMetadataFormProps) {
  const t = useTranslations('admin.document.metaform');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertDocument();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const promise = upsert({
        create: { ...data, file: '', type: '', contentType: '', tenantId },
        update: { ...data, tenantId },
        where: { id: data.id, tenantId },
      });

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: (data) => {
          if (data?.id) {
            router.push({ pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]', params: { tenantId, slug: data?.id } });
          }
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
                <FormItem label={t('documentName')} description={t('documentNameDescription')}>
                  <Input placeholder={t('documentNamePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionDescription')}>
                  <Textarea placeholder={t('descriptionPlaceholder')} rows={3} {...field} value={field.value ?? ''} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem label={t('status')} description={t('statusDescription')}>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{t('statusOptions.DRAFT')}</SelectItem>
                      <SelectItem value="PUBLISHED">{t('statusOptions.PUBLISHED')}</SelectItem>
                      <SelectItem value="ARCHIVED">{t('statusOptions.ARCHIVED')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem label={t('expirationDate')} description={t('expirationDateDescription')}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>{t('pickDate')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} autoFocus />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistantEnabled"
              render={({ field }) => (
                <FormCheckboxItem label={t('assistantEnabled')} description={t('assistantEnabledDescription')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />

            <FormField
              control={form.control}
              name="advancedExcelEnabled"
              render={({ field }) => (
                <FormCheckboxItem label={t('advancedExcelEnabled')} description={t('advancedExcelEnabledDescription')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />

            <FormField
              control={form.control}
              name="downloadOnly"
              render={({ field }) => (
                <FormCheckboxItem label={t('downloadOnly')} description={t('downloadOnlyDescription')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('create')} className="px-4" />
      </FormRoot>
    </Form>
  );
}
