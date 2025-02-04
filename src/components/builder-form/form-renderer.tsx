'use client';

import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { LoaderCircleIcon, MousePointerClick } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import { FormElementInstance, FormElements } from './form-elements';

export interface FormRendererRef {
  submit: () => void;
}

interface FormRendererProps {
  isSubmitting: boolean;
  content: FormElementInstance[];
  onSubmit: (jsonContent: string) => void;
  showSubmitButton?: boolean;
}

const FormRenderer = forwardRef<FormRendererRef, FormRendererProps>(({ isSubmitting, content, onSubmit, showSubmitButton = true }, ref) => {
  const t = useTranslations('component.formBuilder');
  const formValues = useRef<Record<string, string>>({});
  const formErrors = useRef<Record<string, boolean>>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());

  const validateForm = useCallback(() => {
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
      toast({ title: t('error'), description: t('formError'), variant: 'destructive' });
      return;
    }
    try {
      const jsonContent = JSON.stringify(formValues.current);
      onSubmit(jsonContent);
    } catch {
      toast({
        title: t('error'),
        description: t('submissionError'),
        variant: 'destructive',
      });
    }
  };

  useImperativeHandle(ref, () => ({
    submit: submitForm,
  }));

  return (
    <div key={renderKey}>
      {content.map((element) => {
        const FormElement = FormElements[element.type].formComponent;
        return <FormElement key={element.id} elementInstance={element} submitValue={submitValue} isInvalid={formErrors.current[element.id]} defaultValue={formValues.current[element.id]} />;
      })}
      {showSubmitButton && (
        <Button className="mt-8" onClick={submitForm} disabled={isSubmitting}>
          {!isSubmitting && (
            <>
              <MousePointerClick className="mr-2" />
              {t('submit')}
            </>
          )}
          {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        </Button>
      )}
    </div>
  );
});

FormRenderer.displayName = 'FormRenderer';

export default FormRenderer;
