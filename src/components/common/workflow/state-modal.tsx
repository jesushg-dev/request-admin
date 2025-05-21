'use client';

import { useEffect } from 'react';
import { colorOptions, typeOptions } from '@/constants/workflow';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Select, { optionSchema } from '@/components/custom-ui/select';
import { FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export const stateSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'validation.requiredName'),
  description: z.string().optional(),
  color: optionSchema,
  type: optionSchema,
});

export type StateValues = z.infer<typeof stateSchema>;

export const getStateDefaultValue = (): StateValues => ({
  id: '',
  label: '',
  description: '',
  color: { label: 'Gray', value: 'gray' },
  type: { label: 'Default', value: 'default' },
});

interface StateModalProps {
  onClose: () => void;
  defaultValues?: StateValues | null;
  onSave: (values: StateValues) => void;
  showDescription?: boolean;
}

export function StateModal({ onClose, defaultValues, onSave, showDescription }: StateModalProps) {
  const t = useTranslations('admin.workflow.state');

  const form = useForm({
    resolver: zodResolver(stateSchema),
    defaultValues: defaultValues || getStateDefaultValue(),
  });

  const onSubmit = (data: StateValues) => {
    onSave({ ...data, id: defaultValues?.id || crypto.randomUUID() });
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
                    <Input placeholder={t('descriptionPlaceholder')} {...field} />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem label={t('typeLabel')} description={showDescription ? t('typeDescription') : undefined}>
                  <Select isSearchable options={typeOptions} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem label={t('colorLabel')} description={showDescription ? t('colorDescription') : undefined}>
                  <Select isSearchable options={colorOptions} {...field} />
                </FormItem>
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
