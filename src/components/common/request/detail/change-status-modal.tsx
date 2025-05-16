'use client';

import { useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { RequestWorkflowType } from '@/types/prisma/workflow';
import { normalizeValue } from '@/lib/utils';
import { getStatusTransitions } from '@/lib/workflow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Select, { optionSchema, OptionType } from '@/components/custom-ui/select';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

// Zod schema for form validation
export const changeStatusSchema = z
  .object({
    newStatus: optionSchema,
    requiredReason: z.boolean(),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requiredReason && (!data.comments || data.comments.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reason is required for this state transition',
      });
    }
  });

export type ChangeStatusFormValues = z.infer<typeof changeStatusSchema>;

// Default values for the form
export const getDefaultValues = (): ChangeStatusFormValues => ({
  newStatus: { label: '', value: '' },
  requiredReason: false,
  comments: '',
});

type StatusOption = OptionType & {
  requiresApproval?: boolean;
  requiresJustification?: boolean;
};

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  currentStatus: OptionType;
  workflow: RequestWorkflowType;
  enableAssignmentChange: boolean;
}

export function ChangeStatusModal({ isOpen, onClose, currentStatus, requestId, workflow, enableAssignmentChange }: ChangeStatusModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.status');

  const [requiresReason, setRequiresReason] = useState(false);

  const form = useForm<ChangeStatusFormValues>({
    resolver: zodResolver(changeStatusSchema),
    defaultValues: getDefaultValues(),
  });

  // Compute valid next states based on the current status
  const validNextStates: StatusOption[] = useMemo(() => {
    const { allowedTransitions } = getStatusTransitions(workflow, normalizeValue(String(currentStatus?.value)) ?? undefined);
    return allowedTransitions.map((status) => ({ value: status.id, label: status.name, requiresApproval: status.requiresApproval, requiresJustification: status.requiresJustification }));
  }, [workflow, currentStatus]);

  // Handle form submission
  const handleSubmit = (data: ChangeStatusFormValues) => {
    // Extra validation for required justification
    if (requiresReason && (!data.comments || data.comments.trim() === '')) {
      toast.error(t('reasonRequired'), {
        description: t('reasonRequiredDescription'),
      });
      return;
    }

    // Simulate an async request (replace with real API call)
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        // Here you could make the real request
      }, 1500);
    });

    // Show toast notifications for the async operation
    toast.promise(promise, {
      loading: t('toast.loading'),
      success: () => {
        onClose();
        return t('toast.success', {
          requestId,
          from: currentStatus?.label,
          to: data.newStatus.label,
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
                {/* Show transition flow explanation */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('flowTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('flowDescription', {
                      from: currentStatus.label,
                      to: validNextStates.map((status) => status.label).join(', '),
                      count: validNextStates.length,
                    })}
                  </AlertDescription>
                </Alert>
                {/* New status selection */}
                <FormField
                  control={form.control}
                  name="newStatus"
                  render={({ field }) => (
                    <FormItem label={t('newStatus.label')} description={t('newStatus.description')}>
                      <Select
                        menuPortalTarget={null}
                        isSearchable
                        isClearable
                        options={validNextStates}
                        {...field}
                        onChange={(selectedOption: StatusOption | null) => {
                          if (selectedOption?.requiresApproval && !enableAssignmentChange) {
                            toast.error(t('assignmentRequired'), { description: t('assignmentRequiredDescription') });
                            return;
                          }

                          field.onChange(selectedOption);
                          setRequiresReason(selectedOption?.requiresJustification ?? false);
                        }}
                      />
                    </FormItem>
                  )}
                />
                {/* Comments/justification field */}
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem label={requiresReason ? t('comments.labelRequired') : t('comments.label')} description={requiresReason ? t('comments.descriptionRequired') : t('comments.description')}>
                      <Textarea id="comments" placeholder={requiresReason ? t('comments.placeholderRequired') : t('comments.placeholder')} rows={3} required={requiresReason} {...field} />
                    </FormItem>
                  )}
                />
              </FormSection>
            </FormContent>
            <FormActions isPending={form.formState.isSubmitting} title={t('action')} />
          </FormRoot>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
