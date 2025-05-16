'use client';

import { useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Select, { optionSchema, OptionType } from '@/components/custom-ui/select';
import { Hint } from '@/components/hint';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

import { AssignmentCategoryFields, combinedCategoriesSchema, RequestCategoryFields } from '../request-form-stepper/classification-step';

export const reassignAreaSchema = combinedCategoriesSchema.extend({
  reason: z.string().min(1, 'Este campo es obligatorio'),
  notify: optionSchema,
});

export type ReassignAreaFormValues = z.infer<typeof reassignAreaSchema>;

interface ReassignAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  currentArea: OptionType;
}

export function ReassignAreaModal({ isOpen, onClose, requestId }: ReassignAreaModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.form.classificationStep');

  const form = useForm({
    resolver: zodResolver(reassignAreaSchema),
  });

  const notifyOptions = useMemo<OptionType[]>(() => {
    return [
      { value: 'requester', label: t('reassign.notify.requester') },
      { value: 'area', label: t('reassign.notify.area') },
      { value: 'both', label: t('reassign.notify.both') },
    ];
  }, [t]);

  const handleSubmit = (data: ReassignAreaFormValues) => {
    toast(t('reassign.toast.title'), {
      description: t('reassign.toast.description', { requestId, area: data.areaId.label }),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden" ref={formRef}>
        <DialogHeader>
          <DialogTitle>{t('reassign.area.title')}</DialogTitle>
          <DialogDescription>{t('reassign.area.description', { requestId })}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormRoot onSubmit={form.handleSubmit(handleSubmit)}>
            <FormContent>
              <FormSection>
                <div>
                  <h2 className="text-base font-semibold mb-1 flex items-center">
                    {t('requestCategory.title')}
                    <Hint label={t('requestCategory.description')}>
                      <Info className="w-4 h-4 ml-2" />
                    </Hint>
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                    <RequestCategoryFields menuPortalTarget={undefined} />
                  </div>
                </div>

                <Separator className="my-2" />

                <div>
                  <h2 className="text-base font-semibold mb-1 flex items-center">
                    {t('assignmentCategory.title')}
                    <Hint label={t('assignmentCategory.description')}>
                      <Info className="w-4 h-4 ml-2" />
                    </Hint>
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                    <AssignmentCategoryFields menuPortalTarget={undefined} />
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-1">
                  <div className="space-y-1 md:col-span-3">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem label={t('reassign.reason.label')} description={t('reassign.reason.description')}>
                          <Textarea id="reason" placeholder={t('reassign.reason.placeholder')} rows={2} required {...field} className="resize-none" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="notify"
                      render={({ field }) => (
                        <FormItem label={t('reassign.notify.label')} description={t('reassign.notify.description')}>
                          <Select menuPortalTarget={null} isSearchable isClearable options={notifyOptions} {...field} />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </FormSection>
            </FormContent>
            <FormActions isPending={form.formState.isSubmitting} title={t('reassign.area.action')} />
          </FormRoot>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
