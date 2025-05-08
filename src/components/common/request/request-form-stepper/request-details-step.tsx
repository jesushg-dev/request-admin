'use client';

import { type FC } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Select, { OptionType } from '@/components/custom-ui/select';
import { FormCheckboxItem, FormItem, FormSection } from '@/components/shared/form-root';

export const requestDetailSchema = z.object({
  id: z.string(),
  issueSubject: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priorityId: z.object({ value: z.string().min(1), label: z.string() }),
  statusId: z.object({ value: z.string(), label: z.string() }).optional(),
  isDraft: z.boolean(),
});

export type RequestDetailValues = z.infer<typeof requestDetailSchema>;

export const getDefaultDetailsValues = (): RequestDetailValues => ({
  id: generateUuid(),
  issueSubject: '',
  description: '',
  priorityId: { value: '', label: '' },
  statusId: { value: '', label: '' },
  isDraft: true,
});

interface RequestDetailsStepProps {
  isDraftRemovable: boolean;
  prioritiesOptions: OptionType[];
}

const RequestDetailsStep: FC<RequestDetailsStepProps> = ({ isDraftRemovable, prioritiesOptions }) => {
  const t = useTranslations('admin.request.form.detailsStep');
  const { control } = useFormContext<RequestDetailValues>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('detailsStep')}</CardTitle>
        <CardDescription>{t('detailsStepDescription')}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex-col flex overflow-hidden">
        <ScrollArea className="flex-1">
          <FormSection className="px-1">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-6">
              <FormField
                control={control}
                name="issueSubject"
                render={({ field }) => (
                  <FormItem className="col-span-4" label={t('issueSubject')} description={t('issueSubjectDescription')}>
                    <Input id="issueSubject" placeholder={t('issueSubjectPlaceholder')} {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="priorityId"
                render={({ field }) => (
                  <FormItem className="col-span-2" label={t('priority')} description={t('priorityDescription')}>
                    <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} onChange={field.onChange} options={prioritiesOptions} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionDescription')}>
                  <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isDraft"
              render={({ field }) => (
                <FormCheckboxItem label={t('isDraft')} description={t('isDraftDescription')}>
                  <Switch disabled={!isDraftRemovable} checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RequestDetailsStep;
