'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormItem } from '@/components/shared/form-root';
import { type TWorkflowSchema } from '@/services/schemas/workflow';

// Base schema for defineStepper (without internationalization)
// This is used only for the stepper definition
export const workflowFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  requireComments: z.boolean().default(false),
  notifyChanges: z.boolean().default(false),
});

export type WorkflowFormValues = TWorkflowSchema;

export const getWorkflowDefaultValue = (): WorkflowFormValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  isDefault: false,
  requireComments: false,
  notifyChanges: false,
});

export default function RequestWorkflowForm() {
  const t = useTranslations('admin.workflow.form');
  const { control } = useFormContext<WorkflowFormValues>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        {/* Name Field */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem label={t('workflowName')} description={t('workflowNameDescription')}>
              <Input placeholder={t('workflowNamePlaceholder')} {...field} />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem label={t('description')} description={t('descriptionDescription')}>
              <Textarea placeholder={t('descriptionPlaceholder')} {...field} value={field.value ?? ''} />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Default Workflow Switch */}
          <FormField
            control={control}
            name="isDefault"
            render={({ field }) => (
              <FormCheckboxItem label={t('defaultWorkflow')} description={t('defaultWorkflowDesc')}>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormCheckboxItem>
            )}
          />

          {/* Require Comments Switch */}
          <FormField
            control={control}
            name="requireComments"
            render={({ field }) => (
              <FormCheckboxItem label={t('requireComments')} description={t('requireCommentsDesc')}>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormCheckboxItem>
            )}
          />

          {/* Notify Changes Switch */}
          <FormField
            control={control}
            name="notifyChanges"
            render={({ field }) => (
              <FormCheckboxItem label={t('notifyChanges')} description={t('notifyChangesDesc')}>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormCheckboxItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
