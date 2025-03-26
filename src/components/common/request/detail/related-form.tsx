'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRelatedIncident } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

const RelatedIncidentSchema = z.object({
  id: z.string(),
  relatedId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

export type RelatedIncident = z.infer<typeof RelatedIncidentSchema>;

export const getDefaultValues = (): RelatedIncident => ({
  id: generateUuid(),
  relatedId: '',
  isActive: true,
});

interface RelatedIncidentFormProps {
  tenantId: string;
  requestId: string;
  initialValues?: RelatedIncident | null;
}

export function RelatedIncidentForm({ tenantId, requestId, initialValues }: RelatedIncidentFormProps) {
  const t = useTranslations('admin.request.relatedIncidentForm');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRelatedIncident();

  const form = useForm<RelatedIncident>({
    resolver: zodResolver(RelatedIncidentSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const onSubmit = ({ id, relatedId }: RelatedIncident) => {
    startTransition(async () => {
      const promise = upsert({
        create: { tenantId, requestId, relatedId },
        update: { tenantId, requestId, relatedId },
        where: { id },
      });

      toast.promise(promise, {
        loading: t('savingChanges'),
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/requests-portal/requests/[slug]', params: { tenantId, slug: requestId } });
          return t('successSave', { id: response?.id ?? '' });
        },
        error: (error) => t('errorSave', { message: error.message }),
      });
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent error={error}>
          <FormSection>
            <FormField
              control={form.control}
              name="relatedId"
              render={({ field }) => (
                <FormItem label={t('relatedId')} description={t('relatedIdDescription')}>
                  <Input pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" placeholder="00000000-0000-0000-0000-000000000000" {...field} />
                </FormItem>
              )}
            />
          </FormSection>
        </FormContent>

        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('addRelatedIncident')} className="mt-4" />
      </FormRoot>
    </Form>
  );
}
