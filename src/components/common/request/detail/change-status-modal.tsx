'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { updateCurrentStatus } from '@/actions/request-assignment';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, SquarePen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { RequestWorkflowType } from '@/types/zenstackhq/workflow';
import { normalizeValue } from '@/lib/utils';
import { getStatusTransitions } from '@/lib/workflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import Select, { optionSchema, OptionType } from '@/components/custom-ui/select';
import { Hint } from '@/components/hint';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

import { RequestFormStepperType } from '../request-form-stepper';

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
  tenantId: string;
  enableStatusChange: boolean;
  IsStatusModalOpen: boolean;
  workflow: RequestWorkflowType;
  enableAssignmentChange: boolean;
  setIsStatusModalOpen: (IsStatusModalOpen: boolean) => void;
  request: Pick<RequestFormStepperType, 'id' | 'statusId' | 'isDraft'>;
}

export function ChangeStatusModal({ IsStatusModalOpen, tenantId, request, workflow, enableAssignmentChange, enableStatusChange, setIsStatusModalOpen }: ChangeStatusModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.status');

  const [isPending, startTransition] = useTransition();
  const [requiresReason, setRequiresReason] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OptionType | undefined>(request.statusId);

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
    const promise = updateCurrentStatus(tenantId, request.id, String(data.newStatus.value), {
      type: 'STATUS_CHANGE',
      requiredReason: data.requiredReason,
      comments: data.comments,
    });

    // Show toast notifications for the async operation
    startTransition(async () => {
      toast.promise(promise, {
        loading: t('toast.loading'),
        success: () => {
          form.reset(getDefaultValues());
          setCurrentStatus(data.newStatus);
          setIsStatusModalOpen(false);
          return t('toast.success', { requestId: request.id, from: currentStatus?.label ?? 'N/A', to: data.newStatus.label });
        },
        error: (error) => {
          return t('toast.error', { error: error.message });
        },
      });
    });
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex gap-2 w-full justify-between">
          <div>
            <p className="text-sm font-medium">{t('currentStatus')}</p>
            <Badge>{request.isDraft ? t('draft') : currentStatus?.label ? currentStatus.label : 'N/A'}</Badge>
          </div>
          {enableStatusChange && !request.isDraft && (
            <Hint label={t('changeStatus')}>
              <Button size="sm" variant="ghost" aria-label={t('changeStatus')} onClick={() => setIsStatusModalOpen(true)}>
                <SquarePen className="h-4 w-4" />
              </Button>
            </Hint>
          )}
        </div>
        {!request.isDraft && (
          <p className="text-xs text-muted-foreground mt-1 w-full">
            {t('flowDescriptionShort', {
              to: validNextStates.map((status) => status.label).join(', '),
              count: validNextStates.length,
            })}
          </p>
        )}
      </div>
      <Dialog open={IsStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden" ref={formRef}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description', { requestId: request.id })}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <FormRoot onSubmit={form.handleSubmit(handleSubmit)}>
              <FormContent>
                <FormSection>
                  {/* Show transition flow explanation */}
                  <AlertBanner
                    variant="info"
                    icon={<AlertCircle className="h-4 w-4" />}
                    title={t('flowTitle')}
                    description={t('flowDescription', {
                      from: currentStatus?.label ?? 'N/A',
                      to: validNextStates.map((status) => status.label).join(', '),
                      count: validNextStates.length,
                    })}
                  />

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
              <FormActions isPending={isPending} title={t('action')} />
            </FormRoot>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
