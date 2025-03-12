'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { LoaderCircleIcon, MousePointerClick } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { FormElementInstance, FormElements } from './form-elements';

export interface FormRendererRef {
  submit: () => void;
}

interface FormRendererProps {
  isSubmitting?: boolean;
  content: FormElementInstance[];
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  showSubmitButton?: boolean;
}

const FormRenderer = forwardRef<FormRendererRef, FormRendererProps>(({ initialValues = {}, isSubmitting, content, onSubmit, showSubmitButton = true }, ref) => {
  const t = useTranslations('component.form');
  const formValues = useRef<Record<string, string>>({ ...initialValues });
  const formErrors = useRef<Record<string, boolean>>({});

  const validateForm = useCallback(() => {
    formErrors.current = {};
    for (const field of content) {
      const actualValue = formValues.current[field.id] || '';
      const valid = FormElements[field.type].validate(field, actualValue);
      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }
    return Object.keys(formErrors.current).length === 0;
  }, [content]);

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  const submitForm = () => {
    try {
      const validForm = validateForm();

      if (!validForm) {
        toast.error(t('error'), { description: t('formError'), position: 'top-right' });
        return;
      }

      onSubmit(formValues.current);
    } catch {
      toast.error(t('error'), { description: t('submissionError'), position: 'top-right' });
    }
  };

  // Usar useImperativeHandle con el tipo correcto
  useImperativeHandle(ref, () => ({
    submit: submitForm,
  }));

  useEffect(() => {
    formValues.current = { ...initialValues };
  }, [initialValues]);

  return (
    <>
      {content.map((element) => {
        const FormElement = FormElements[element.type].formComponent;
        return <FormElement key={element.id} elementInstance={element} submitValue={submitValue} isInvalid={formErrors.current[element.id]} defaultValue={formValues.current[element.id]} />;
      })}
      {showSubmitButton && (
        <Button onClick={submitForm} disabled={isSubmitting}>
          {!isSubmitting && (
            <>
              <MousePointerClick className="mr-2" />
              {t('submit')}
            </>
          )}
          {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        </Button>
      )}
    </>
  );
});

FormRenderer.displayName = 'FormRenderer';

export default FormRenderer;
