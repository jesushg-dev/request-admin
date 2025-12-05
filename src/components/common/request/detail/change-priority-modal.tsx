'use client';

import { useRef, useState, useTransition } from 'react';
import { updateCurrentPriority } from '@/actions/request-assignment';
import { useChangePrioritySchema, type TChangePrioritySchema } from '@/services/schemas/request';
import { zodResolver } from '@hookform/resolvers/zod';
import { SquarePen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Select, { OptionType } from '@/components/custom-ui/select';
import { Hint } from '@/components/hint';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export type ChangePriorityFormValues = TChangePrioritySchema;

// Default values for the form
export const getDefaultValues = (): ChangePriorityFormValues => ({
  reason: '',
  newPriority: { label: '', value: '' },
  notify: { label: '', value: '' },
});

interface ChangePriorityModalProps {
  tenantId: string;
  requestId: string;
  defaultPriority: OptionType;
  priorities: OptionType[];
  enablePriorityChange: boolean;
  isPriorityModalOpen: boolean;
  setIsPriorityModalOpen: (value: boolean) => void;
}

export function ChangePriorityModal({ isPriorityModalOpen, setIsPriorityModalOpen, requestId, defaultPriority, priorities, tenantId, enablePriorityChange }: ChangePriorityModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.priority');
  const [isPending, startTransition] = useTransition();
  const [currentPriority, setCurrentPriority] = useState<OptionType | undefined>(defaultPriority);
  const changePrioritySchema = useChangePrioritySchema();

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
    const promise = updateCurrentPriority(tenantId, requestId, String(data.newPriority.value), {
      type: 'PRIORITY_CHANGE',
      reason: data.reason,
      notify: data.notify.value === 'yes',
    });

    // Show toast notifications for the async operation
    startTransition(() => {
      toast.promise(promise, {
        loading: t('toast.loading'),
        success: () => {
          setIsPriorityModalOpen(false);
          form.reset(getDefaultValues());
          setCurrentPriority(data.newPriority);
          return t('toast.success', {
            requestId,
            priority: data.newPriority.label,
          });
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
            <p className="text-sm font-medium">{t('priority')}</p>
            <Badge>{currentPriority?.label ?? 'N/A'}</Badge>
          </div>
          {enablePriorityChange && (
            <Hint label={t('changePriority')}>
              <Button size="sm" variant="ghost" aria-label={t('changePriority')} onClick={() => setIsPriorityModalOpen(true)}>
                <SquarePen className="h-4 w-4" />
              </Button>
            </Hint>
          )}
        </div>
      </div>
      <Dialog open={isPriorityModalOpen} onOpenChange={setIsPriorityModalOpen}>
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
                    <div className="text-sm text-muted-foreground">{currentPriority?.label ?? 'N/A'}</div>
                  </div>
                  {/* New priority selection */}
                  <FormField
                    control={form.control}
                    name="newPriority"
                    render={({ field }) => (
                      <FormItem label={t('newPriority.label')} description={t('newPriority.description')}>
                        <Select menuPortalTarget={null} isSearchable isClearable options={priorities.filter((option) => option.value !== currentPriority?.value)} {...field} />
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
              <FormActions isPending={isPending} title={t('action')} />
            </FormRoot>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
