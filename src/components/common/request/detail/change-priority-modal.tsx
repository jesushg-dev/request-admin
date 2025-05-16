'use client';

import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Select, { optionSchema, OptionType } from '@/components/custom-ui/select';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

// Zod schema for form validation
export const changePrioritySchema = z.object({
  reason: z.string().min(1, 'Este campo es obligatorio').max(500, 'Máximo 500 caracteres'),
  newPriority: optionSchema,
  notify: optionSchema,
});

export type ChangePriorityFormValues = z.infer<typeof changePrioritySchema>;

// Default values for the form
export const getDefaultValues = (): ChangePriorityFormValues => ({
  reason: '',
  newPriority: { label: '', value: '' },
  notify: { label: '', value: '' },
});

interface ChangePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  currentPriority: OptionType;
  priorities: OptionType[];
}

export function ChangePriorityModal({ isOpen, onClose, requestId, currentPriority, priorities }: ChangePriorityModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.priority');

  // Notify options for the select
  const notifyOptions: OptionType[] = [
    { value: 'yes', label: t('notify.yes') },
    { value: 'no', label: t('notify.no') },
  ];

  // Initialize react-hook-form with validation and default values
  const form = useForm<ChangePriorityFormValues>({
    resolver: zodResolver(changePrioritySchema),
    defaultValues: getDefaultValues(),
  });

  // Handle form submission
  const handleSubmit = (data: ChangePriorityFormValues) => {
    // Simulate an async request (replace with real API call)
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });

    // Show toast notifications for the async operation
    toast.promise(promise, {
      loading: t('toast.loading'),
      success: () => {
        onClose();
        return t('toast.success', {
          requestId,
          priority: data.newPriority.label,
        });
      },
      error: (error) => {
        return t('toast.error', { error: error.message });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden" ref={formRef}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { requestId })}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormRoot onSubmit={form.handleSubmit(handleSubmit)}>
            <FormContent>
              <FormSection>
                {/* Display current priority */}
                <div className="grid gap-2">
                  <Label htmlFor="current-priority">{t('currentPriority')}</Label>
                  <div className="text-sm text-muted-foreground">{currentPriority.label}</div>
                </div>
                {/* New priority selection */}
                <FormField
                  control={form.control}
                  name="newPriority"
                  render={({ field }) => (
                    <FormItem label={t('newPriority.label')} description={t('newPriority.description')}>
                      <Select menuPortalTarget={null} isSearchable isClearable options={priorities} {...field} />
                    </FormItem>
                  )}
                />
                {/* Reason for change (optional) */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem label={t('reason.label')} description={t('reason.description')}>
                      <Textarea id="reason" required placeholder={t('reason.placeholder')} rows={3} {...field} />
                    </FormItem>
                  )}
                />
                {/* Notify requester */}
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem label={t('notify.label')} description={t('notify.description')}>
                      <Select menuPortalTarget={null} isSearchable isClearable options={notifyOptions} {...field} />
                    </FormItem>
                  )}
                />
              </FormSection>
            </FormContent>
            {/* Form actions (submit/cancel) */}
            <FormActions isPending={form.formState.isSubmitting} title={t('action')} />
          </FormRoot>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
