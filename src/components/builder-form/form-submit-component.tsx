'use client';

import React, { useTransition, type FC } from 'react';
import { SubmitForm } from '@/actions/form';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { FormElementInstance } from './form-elements';
import FormRenderer from './form-renderer';

interface FormSubmitComponentProps {
  tenantId: string;
  formId: string;
  content: FormElementInstance[];
}

const FormSubmitComponent: FC<FormSubmitComponentProps> = ({ tenantId, formId, content }) => {
  const router = useRouter();
  const t = useTranslations('component.formBuilder');

  const [pending, startTransition] = useTransition();

  const submitForm = async (values: Record<string, string>) => {
    const promise = SubmitForm(tenantId, formId, values);
    toast.promise(promise, {
      loading: t('submitting'),
      success: () => {
        router.push({ pathname: '/admin/[tenantId]/form-designer/[slug]', params: { tenantId, slug: formId } });
        return t('formSubmitted');
      },
      error: (error) => {
        return `${t('submissionError')}: ${error.message}`;
      },
    });
  };

  return (
    <FormRenderer
      isSubmitting={pending}
      content={content}
      onSubmit={(jsonContent) => {
        startTransition(submitForm.bind(null, jsonContent));
      }}
    />
  );
};

export default FormSubmitComponent;
