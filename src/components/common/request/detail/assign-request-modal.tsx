'use client';

import { useMemo, useRef } from 'react';
import { useFindManyUserTenantArea } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Select, { optionSchema, type OptionType } from '@/components/custom-ui/select';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export const assignRequestSchema = z.object({
  assignee: optionSchema,
  comments: z.string().optional(),
});

export type AssignRequestFormValues = z.infer<typeof assignRequestSchema>;

export const getDefaultValues = (): AssignRequestFormValues => ({
  assignee: { label: '', value: '' },
  comments: '',
});

interface AssignRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  area: OptionType;
  currentAssignee?: string;
  tenantId: string;
}

export function AssignRequestModal({ isOpen, onClose, requestId, area, currentAssignee, tenantId }: AssignRequestModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.assign');

  const form = useForm<AssignRequestFormValues>({
    resolver: zodResolver(assignRequestSchema),
    defaultValues: getDefaultValues(),
  });

  const { data = [], isLoading } = useFindManyUserTenantArea({
    select: {
      userTenant: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    where: { areaId: String(area.value), tenantId },
  });

  const areaUsers: OptionType[] = useMemo(() => {
    return data.map((user) => ({
      value: user.userTenant.id,
      label: `${user.userTenant.user.name} (${user.userTenant.user.email})`,
    }));
  }, [data]);

  const handleSubmit = (data: AssignRequestFormValues) => {
    //fake promise
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        console.log(data);
      }, 2000);
    });

    toast.promise(promise, {
      loading: t('toast.loading'),
      success: () => {
        onClose();
        return t('toast.success');
      },
      error: (error) => {
        console.error('Error assigning request:', error);
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
                <div className="grid gap-2">
                  <Label htmlFor="area">{t('area')}</Label>
                  <div className="text-sm text-muted-foreground">{area.label}</div>
                </div>
                {currentAssignee && (
                  <div className="grid gap-2">
                    <Label htmlFor="current-assignee">{t('currentAssignee')}</Label>
                    <div className="text-sm text-muted-foreground">{currentAssignee}</div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem label={t('assignee.label')} description={t('assignee.description')}>
                      <Select menuPortalTarget={null} isLoading={isLoading} isSearchable isClearable options={areaUsers} {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem label={t('comments.label')} description={t('comments.description')}>
                      <Textarea id="comments" placeholder={t('comments.placeholder')} rows={3} {...field} />
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
