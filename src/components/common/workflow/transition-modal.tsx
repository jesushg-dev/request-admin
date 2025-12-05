'use client';

import { useEffect } from 'react';
import { useTransitionSchema, type TTransitionSchema } from '@/services/schemas/workflow';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export type TransitionValues = TTransitionSchema;

export const getTransitionDefaultValue = (): TransitionValues => ({
  id: generateUuid(),
  label: '',
  description: '',
  requiresApproval: false,
  requiresJustification: false,
});

interface TransitionModalProps {
  onClose: () => void;
  defaultValues?: TransitionValues | null;
  onSave: (values: TransitionValues) => void;
  showDescription?: boolean;
}

export function TransitionModal({ onClose, defaultValues, onSave, showDescription }: TransitionModalProps) {
  const t = useTranslations('admin.workflow.transition');
  const transitionSchema = useTransitionSchema();

  const form = useForm({
    resolver: zodResolver(transitionSchema),
    defaultValues: defaultValues || getTransitionDefaultValue(),
  });

  const onSubmit = (data: TransitionValues) => {
    onSave({ ...data });
    onClose();
  };

  useEffect(() => {
    if (!defaultValues) return;
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
          <FormSection>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem label={t('nameLabel')} description={showDescription ? t('nameDescription') : undefined}>
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            {showDescription && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem label={t('descriptionLabel')} description={showDescription ? t('descriptionDescription') : undefined}>
                    <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="requiresApproval"
              render={({ field }) => (
                <FormCheckboxItem label={t('approvalLabel')} description={showDescription ? t('approvalDescription') : undefined}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresJustification"
              render={({ field }) => (
                <FormCheckboxItem label={t('justificationLabel')} description={showDescription ? t('justificationDescription') : undefined}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormCheckboxItem>
              )}
            />
          </FormSection>
        </FormContent>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          {/* for some reason, when the button is submit type, it propagates to the parent form which is not desired */}
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            {t('save')}
          </Button>
        </div>
      </FormRoot>
    </Form>
  );
}
