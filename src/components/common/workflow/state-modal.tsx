'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormLabel, FormItem as ShadcnFormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

const colorOptions = ['gray', 'blue', 'indigo', 'green', 'red', 'yellow'] as const;

export const stateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'validation.requiredName'),
  description: z.string().optional(),
  color: z.enum(colorOptions),
  isInitial: z.boolean().default(false),
  isFinal: z.boolean().default(false),
});

export type StateValues = z.infer<typeof stateSchema>;

export const getStateDefaultValue = (): StateValues => ({
  id: '',
  name: '',
  description: '',
  color: 'gray',
  isInitial: false,
  isFinal: false,
});

interface StateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: StateValues | null;
  onSave: (values: StateValues) => void;
}

export function StateModal({ isOpen, onClose, defaultValues, onSave }: StateModalProps) {
  const t = useTranslations('admin.workflow.state');

  const form = useForm({
    resolver: zodResolver(stateSchema),
    defaultValues: defaultValues || getStateDefaultValue(),
  });

  const { control, reset } = form;

  useEffect(() => {
    reset(defaultValues || getStateDefaultValue());
  }, [defaultValues, reset]);

  const onSubmit = (data: StateValues) => {
    onSave({ ...data, id: defaultValues?.id || crypto.randomUUID() });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-h-[calc(100vh-2rem)] sm:max-w-[500px]', 'flex flex-col overflow-hidden')}>
        <DialogHeader>
          <DialogTitle>{t(defaultValues ? 'editTitle' : 'addTitle')}</DialogTitle>
          <DialogDescription>{t(defaultValues ? 'editDescription' : 'addDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
            <FormContent>
              <FormSection>
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem label={t('nameLabel')} description={t('nameDescription')}>
                      <Input placeholder={t('namePlaceholder')} {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem label={t('descriptionLabel')} description={t('descriptionDescription')}>
                      <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <FormItem label={t('colorLabel')} description={t('colorDescription')}>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4">
                        {colorOptions.map((color) => (
                          <ShadcnFormItem key={color} className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={color} className="peer sr-only" />
                            </FormControl>
                            <div className={`peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-${color}-400 h-8 w-8 rounded-full bg-${color}-100`} />
                            <FormLabel className="text-sm font-normal">{t(`colors.${color}`)}</FormLabel>
                          </ShadcnFormItem>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="isInitial"
                  render={({ field }) => (
                    <FormCheckboxItem label={t('initialStateLabel')} description={t('initialStateDescription')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormCheckboxItem>
                  )}
                />

                <FormField
                  control={control}
                  name="isFinal"
                  render={({ field }) => (
                    <FormCheckboxItem label={t('finalStateLabel')} description={t('finalStateDescription')}>
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
      </DialogContent>
    </Dialog>
  );
}
