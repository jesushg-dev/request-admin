'use client';

import { FC, useEffect, useRef } from 'react';
import { useFindManyForm } from '@/services/api/hooks';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormElementInstance } from '@/components/builder-form/form-elements';
import FormRenderer, { FormRendererRef } from '@/components/builder-form/form-renderer';
import EmptyState from '@/components/shared/empty-state';
import { ZodErrorAlert } from '@/components/shared/zod-error-alert';
import { useChildSteps } from '@/components/stepper/child-steps-context';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

export const formResponseSchema = z.object({
  submissions: z.record(z.record(z.string())).optional(),
});

export type FormResponsesValues = z.infer<typeof formResponseSchema>;

export const getDefaultFormResponsesValues = (): FormResponsesValues => ({
  submissions: {},
});

interface DynamicFormStepProps {
  onPrev: () => void;
  onNext: () => void;
  requestCategoryIds: string[];
}

export const DynamicFormStep: FC<DynamicFormStepProps> = ({ requestCategoryIds, onPrev, onNext }) => {
  const t = useTranslations('admin.request.form.dynamicFormStep');
  const formRef = useRef<FormRendererRef>(null);
  const { control, formState } = useFormContext<FormResponsesValues>();

  const { steps, currentChildStepIndex, setChildrenSteps, updateChildStepStatus, setCurrentChildStepIndex } = useChildSteps();

  const { data, isLoading } = useFindManyForm({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, content: true },
    where: {
      categoryForms: { some: { categoryId: { in: requestCategoryIds } } },
    },
  });

  useEffect(() => {
    if (data) {
      if (!data.length && !steps['dynamicForm']) {
        onNext();
      }

      if (steps['dynamicForm']) return;

      setChildrenSteps(
        'dynamicForm',
        data.map((form) => ({
          id: form.id,
          label: form.name,
          description: form.description,
          status: 'pending',
        }))
      );
    }
  }, [data, steps]);

  const onBack = () => {
    if (currentChildStepIndex === 0) {
      onPrev();
    } else {
      setCurrentChildStepIndex((prev) => prev - 1);
    }
  };

  const onSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 flex-1 overflow-hidden">
        <Skeleton className="h-15" />
        {Array.from({ length: 15 }).map((_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        <EmptyState title={t('emptyState.title')} icons={[FileText]} description={t('emptyState.description')} />
        <StepperNavigationButtons isLastStep={false} isFirstStep={false} onPrev={onBack} onReset={console.log} nextText={t('next')} submitText={t('finish')} onNext={onNext} />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div>
          <CardTitle>{data[currentChildStepIndex]?.name}</CardTitle>
          <CardDescription>{data[currentChildStepIndex]?.description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('stepCounter', { current: currentChildStepIndex + 1, total: data.length })}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1 overflow-y-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-hidden">
          <ZodErrorAlert />
          <ScrollArea className="flex flex-1 gap-4">
            <div className="flex flex-col gap-4 flex-1 mx-1">
              {data[currentChildStepIndex] && (
                <Controller
                  control={control}
                  name={`submissions.${data[currentChildStepIndex].id}`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormRenderer
                        ref={formRef}
                        onSubmit={(value) => {
                          onChange(value);
                          updateChildStepStatus('dynamicForm', data[currentChildStepIndex].id, 'completed');
                          if (currentChildStepIndex === data.length - 1) {
                            onNext();
                          } else {
                            setCurrentChildStepIndex((prev) => prev + 1);
                          }
                        }}
                        showSubmitButton={false}
                        initialValues={value}
                        content={JSON.parse(data[currentChildStepIndex].content ?? '[]') as FormElementInstance[]}
                      />
                    );
                  }}
                />
              )}
            </div>
          </ScrollArea>
          {formState.errors?.submissions?.[data[currentChildStepIndex]?.id]?.response?.message && (
            <p className="text-red-500 text-sm">{formState.errors.submissions?.[data[currentChildStepIndex]?.id]?.response?.message?.toString() ?? ''}</p>
          )}
        </div>
      </div>
      <StepperNavigationButtons
        isLastStep={false}
        isFirstStep={false}
        onPrev={onBack}
        onReset={console.log}
        nextText={t('next')}
        submitText={t('finish')}
        onNext={currentChildStepIndex !== data.length ? onSubmit : undefined}
      />
    </>
  );
};

export default DynamicFormStep;
