'use client';

import React, { useTransition } from 'react';
import { useUpdateDataroomViewerGroup } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

const formSchema = z.object({
  allowedDomains: z.string(),
  allowAll: z.boolean().default(false),
});

export const getDefaultValues = () => ({
  allowedDomains: '',
  allowAll: false,
});

export type DomainSettingsFormValues = z.infer<typeof formSchema>;

interface DomainSettingsManagementProps {
  tenantId: string;
  dataroomId: string;
  selectedGroupId: string;
  initialValues?: DomainSettingsFormValues;
}

export function DomainSettingsManagement({ tenantId, dataroomId, selectedGroupId, initialValues }: DomainSettingsManagementProps) {
  const t = useTranslations('admin.dataroom.groups.settings');
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const { mutateAsync: updateGroup } = useUpdateDataroomViewerGroup();

  const handleSubmit = (values: DomainSettingsFormValues) => {
    startTransition(async () => {
      try {
        toast.promise(updateGroup({ data: { ...values }, where: { id: selectedGroupId, tenantId, dataroomId } }), {
          loading: t('savingSettings'),
          success: t('saveSuccess'),
          error: (error) => t('saveError', { message: error.message }),
        });
      } catch (error) {
        console.error('Error updating domain settings:', error);
      }
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(handleSubmit)}>
        <FormContent>
          <FormSection title={t('accessSettings')}>
            <FormField
              control={form.control}
              name="allowedDomains"
              render={({ field }) => (
                <FormItem label={t('allowedDomains')} description={t('allowedDomainsDescription')}>
                  <Input id="allowed-domains" placeholder={t('domainsPlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowAll"
              render={({ field }) => (
                <FormItem label={t('allowAllAccess')} description={t('allowAllAccessDescription')} className="flex flex-row items-center justify-between p-4 border rounded-lg">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormItem>
              )}
            />
          </FormSection>

          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">{t('settingsExplanation')}</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>{t('explanationPoint1')}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>{t('explanationPoint2')}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>{t('explanationPoint3')}</span>
              </li>
            </ul>
          </div>
        </FormContent>

        <FormActions isPending={isPending} title={t('saveSettings')} />
      </FormRoot>
    </Form>
  );
}
