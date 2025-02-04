'use client';

import React, { useState, useTransition, type FC } from 'react';
import { SubmitForm } from '@/actions/form';
import { useTranslations } from 'next-intl';

import { toast } from '@/components/ui/use-toast';

import { FormElementInstance } from './form-elements';
import FormRenderer from './form-renderer';

interface FormSubmitComponentProps {
  tenantId: string;
  formId: string;
  content: FormElementInstance[];
}

const FormSubmitComponent: FC<FormSubmitComponentProps> = ({ tenantId, formId, content }) => {
  const t = useTranslations('component.formBuilder');

  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const submitForm = async (jsonContent: string) => {
    try {
      await SubmitForm(tenantId, formId, jsonContent);
      setSubmitted(true);
    } catch {
      toast({
        title: t('error'),
        description: t('submissionError'),
        variant: 'destructive',
      });
    }
  };

  if (submitted) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="bg-background flex w-full max-w-[620px] grow flex-col gap-4 overflow-y-auto rounded border p-8 ">
          <h1 className="text-2xl font-bold">{t('formSubmitted')}</h1>
          <p className="text-muted-foreground">{t('submissionMessage')}</p>
        </div>
      </div>
    );
  }

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
