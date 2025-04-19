'use client';

import { type FC } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Select, { OptionType } from '@/components/custom-ui/select';

export const requestDetailSchema = z.object({
  id: z.string(),
  issueSubject: z.string(),
  description: z.string().max(5000).optional(),
  comment: z.string().max(255).optional(),
  priorityId: z.object({ value: z.string().min(1), label: z.string() }),
  statusId: z.object({ value: z.string().min(1), label: z.string() }),
});

export type RequestDetailValues = z.infer<typeof requestDetailSchema>;

export const getDefaultDetailsValues = (): RequestDetailValues => ({
  id: generateUuid(),
  issueSubject: '',
  description: '',
  comment: '',
  priorityId: { value: '', label: '' },
  statusId: { value: '', label: '' },
});

interface RequestDetailsStepProps {
  statusesOptions: OptionType[];
  prioritiesOptions: OptionType[];
}

const RequestDetailsStep: FC<RequestDetailsStepProps> = ({ statusesOptions, prioritiesOptions }) => {
  const t = useTranslations('admin.request.form.detailsStep');
  const { control } = useFormContext<RequestDetailValues>();

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-2 mx-1">
        <FormField
          control={control}
          name="issueSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('issueSubject')}</FormLabel>
              <FormControl>
                <Input id="issueSubject" placeholder={t('issueSubjectPlaceholder')} {...field} />
              </FormControl>
              <FormDescription>{t('issueSubjectDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <FormField
            control={control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('status')}</FormLabel>
                <FormControl>
                  <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} onChange={field.onChange} options={statusesOptions} />
                </FormControl>
                <FormDescription>{t('statusDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="priorityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('priority')}</FormLabel>
                <FormControl>
                  <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} onChange={field.onChange} options={prioritiesOptions} />
                </FormControl>
                <FormDescription>{t('priorityDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="comment"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('comment')}</FormLabel>
              <FormControl>
                <Input id="comment" placeholder={t('commentPlaceholder')} {...field} />
              </FormControl>
              <FormDescription>{t('commentDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({}) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl></FormControl>
              <FormDescription>{t('descriptionDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </ScrollArea>
  );
};

export default RequestDetailsStep;
