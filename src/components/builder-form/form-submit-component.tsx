'use client';

import React, { useCallback, useRef, useState, useTransition } from 'react';
import { SubmitForm } from '@/actions/form';
import { useTranslations } from 'next-intl';
import { HiCursorClick } from 'react-icons/hi';
import { ImSpinner2 } from 'react-icons/im';

import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import { FormElementInstance, FormElements } from './form-elements';

function FormSubmitComponent({ formUrl, content }: { content: FormElementInstance[]; formUrl: string }) {
  const t = useTranslations('component.formBuilder');
  const tenantId = useTenantId();
  const formValues = useRef<Record<string, string>>({});
  const formErrors = useRef<Record<string, boolean>>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());

  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const validateForm: () => boolean = useCallback(() => {
    for (const field of content) {
      const actualValue = formValues.current[field.id] || '';
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    if (Object.keys(formErrors.current).length > 0) {
      return false;
    }

    return true;
  }, [content]);

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  const submitForm = async () => {
    formErrors.current = {};
    const validForm = validateForm();
    if (!validForm) {
      setRenderKey(new Date().getTime());
      toast({
        title: t('error'),
        description: t('formError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(formValues.current);
      await SubmitForm(tenantId, formUrl, jsonContent);
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
        <div className="flex w-full max-w-[620px] grow flex-col gap-4 overflow-y-auto rounded border bg-background p-8 shadow-xl shadow-blue-700">
          <h1 className="text-2xl font-bold">{t('formSubmitted')}</h1>
          <p className="text-muted-foreground">{t('submissionMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div key={renderKey}>
      {content.map((element) => {
        const FormElement = FormElements[element.type].formComponent;
        return <FormElement key={element.id} elementInstance={element} submitValue={submitValue} isInvalid={formErrors.current[element.id]} defaultValue={formValues.current[element.id]} />;
      })}
      <Button
        className="mt-8"
        onClick={() => {
          startTransition(submitForm);
        }}
        disabled={pending}>
        {!pending && (
          <>
            <HiCursorClick className="mr-2" />
            {t('submit')}
          </>
        )}
        {pending && <ImSpinner2 className="animate-spin" />}
      </Button>
    </div>
  );
}

export default FormSubmitComponent;
