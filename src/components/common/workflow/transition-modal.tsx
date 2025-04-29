'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormCheckboxItem, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

import { getStateDefaultValue } from './state-modal';

interface WorkflowState {
  id: string;
  name: string;
}

export const transitionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'validation.requiredName'),
  description: z.string().optional(),
  sourceId: z.string({ required_error: 'validation.requiredSource' }),
  targetId: z.string({ required_error: 'validation.requiredTarget' }),
  requiresJustification: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
});

export type TransitionValues = z.infer<typeof transitionSchema>;

export const getTransitionDefaultValue = (): TransitionValues => ({
  id: generateUuid(),
  name: '',
  description: '',
  sourceId: '',
  targetId: '',
  requiresJustification: false,
  requiresApproval: false,
});

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  states: WorkflowState[];
  defaultValues?: TransitionValues | null;
  onSave: (values: TransitionValues) => void;
}

export function TransitionModal({ isOpen, onClose, states, defaultValues, onSave }: TransitionModalProps) {
  const t = useTranslations('admin.workflow.transition');

  const form = useForm({
    resolver: zodResolver(transitionSchema),
    defaultValues: defaultValues || getTransitionDefaultValue(),
  });

  const { control, reset } = form;

  useEffect(() => {
    reset(defaultValues || getStateDefaultValue());
  }, [defaultValues, reset]);

  const onSubmit = (data: TransitionValues) => {
    onSave({ ...data });
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="sourceId"
                    render={({ field }) => (
                      <FormItem label={t('sourceLabel')} description={t('sourceDescription')}>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('sourcePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="targetId"
                    render={({ field }) => (
                      <FormItem label={t('targetLabel')} description={t('targetDescription')}>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('targetPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="requiresJustification"
                  render={({ field }) => (
                    <FormCheckboxItem label={t('justificationLabel')} description={t('justificationDescription')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormCheckboxItem>
                  )}
                />

                <FormField
                  control={control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormCheckboxItem label={t('approvalLabel')} description={t('approvalDescription')}>
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
