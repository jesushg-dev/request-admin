'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertDocument } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        {error && <PrismaErrorAlert error={error} />}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('documentName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('documentNamePlaceholder')} />
                  </FormControl>
                  <FormDescription>{t('documentNameDescription')}</FormDescription>
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
                    <Textarea {...field} placeholder={t('descriptionPlaceholder')} value={field.value ?? ''} rows={3} />
                  </FormControl>
                  <FormDescription>{t('descriptionDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">{t('statusOptions.DRAFT')}</SelectItem>
                      <SelectItem value="PUBLISHED">{t('statusOptions.PUBLISHED')}</SelectItem>
                      <SelectItem value="ARCHIVED">{t('statusOptions.ARCHIVED')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('expirationDate')}</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistantEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>AI Assistant</FormLabel>
                    <FormDescription>Enable AI analysis of this document</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="advancedExcelEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Advanced Excel Features</FormLabel>
                    <FormDescription>Enable advanced Excel processing</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="downloadOnly"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Download Only</FormLabel>
                    <FormDescription>Document can only be downloaded, not viewed</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
}
