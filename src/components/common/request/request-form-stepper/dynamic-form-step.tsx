import { FC, useEffect, useRef } from 'react';
import { useFindManyForm } from '@/services/api/hooks';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormElementInstance } from '@/components/builder-form/form-elements';
import FormRenderer, { FormRendererRef } from '@/components/builder-form/form-renderer';
import EmptyState from '@/components/shared/empty-state';
import { ZodErrorAlert } from '@/components/shared/zod-error-alert';
import { useChildSteps } from '@/components/stepper/child-steps-context';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

export const formResponseSchema = z.object({
  submissions: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

export type FormResponsesValues = z.infer<typeof formResponseSchema>;

export const getDefaultFormResponsesValues = (): FormResponsesValues => ({
  submissions: {},
});

interface DynamicFormStepProps {
  onPrev: () => void;
  onNext: () => void;
  requestCategoryIds: string[];
  assignmentCategoryIds: string[];
}

export const DynamicFormStep: FC<DynamicFormStepProps> = ({ requestCategoryIds, assignmentCategoryIds, onPrev, onNext }) => {
  console.log({ requestCategoryIds, assignmentCategoryIds });
  const t = useTranslations('admin.request.form.dynamicFormStep');
  const formRef = useRef<FormRendererRef>(null);
  const { control, formState } = useFormContext<FormResponsesValues>();

  const { steps, currentChildStepIndex, setChildrenSteps, updateChildStepStatus, setCurrentChildStepIndex } = useChildSteps();

  // Build where condition based on available category IDs
  const buildWhereCondition = () => {
    const conditions = [];

    if (requestCategoryIds.length > 0) {
      conditions.push({
        requestCategoryForms: {
          some: { categoryId: { in: requestCategoryIds } },
        },
      });
    }

    if (assignmentCategoryIds.length > 0) {
      conditions.push({
        assignmentCategoryForms: {
          some: { categoryId: { in: assignmentCategoryIds } },
        },
      });
    }

    // If no conditions, return a condition that will return no results
    if (conditions.length === 0) {
      return { id: { equals: 'no-match' } }; // This will return empty array
    }

    // If only one condition, return it directly
    if (conditions.length === 1) {
      return conditions[0];
    }

    // If multiple conditions, use OR
    return { OR: conditions };
  };

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useFindManyForm(
    {
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, content: true },
      where: buildWhereCondition(),
    },
    {
      // Only enable query if we have at least one category ID
      enabled: requestCategoryIds.length > 0 || assignmentCategoryIds.length > 0,
    }
  );

  console.log({ data, isLoading, isError });

  // FIX: Only execute effects after query completes (not loading and not error)
  useEffect(() => {
    // Don't do anything while loading or if there's an error
    if (isLoading || isError) {
      return;
    }

    // If no categories provided, skip to next step immediately
    if (requestCategoryIds.length === 0 && assignmentCategoryIds.length === 0) {
      console.log('No categories provided, skipping to next step');
      onNext();
      return;
    }

    // If query completed but no forms found, skip to next step
    if (data.length === 0 && !steps['dynamicForm']) {
      console.log('No forms found for categories, skipping to next step');
      onNext();
      return;
    }

    // If we already have steps configured, don't reconfigure
    if (steps['dynamicForm']) {
      return;
    }

    // Configure child steps with the forms
    if (data.length > 0) {
      console.log(
        'Setting up child steps for forms:',
        data.map((f) => f.name)
      );
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
  }, [data, isLoading, isError, onNext, setChildrenSteps, steps, requestCategoryIds.length, assignmentCategoryIds.length]);

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

  // Show error state if query failed
  if (isError) {
    return (
      <>
        <Card className="flex-1 flex flex-col overflow-hidden">
          {error instanceof Error ? (
            <div className="p-6">
              <p className="mt-2 text-sm text-red-500">{error.message}</p>
            </div>
          ) : (
            <div className="p-6">
              <p className="mt-2 text-sm text-red-500">An unknown error occurred while loading forms.</p>
            </div>
          )}
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 flex-1 overflow-hidden p-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          <EmptyState title={t('emptyState.title')} icons={[FileText]} description={t('emptyState.description')} />
        ) : (
          <>
            <div className="flex justify-between items-center w-full p-6 pb-0">
              <div>
                <CardTitle>{data[currentChildStepIndex]?.name}</CardTitle>
                <CardDescription>{data[currentChildStepIndex]?.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('stepCounter', { current: currentChildStepIndex + 1, total: data.length })}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 flex-1 overflow-y-hidden p-6 pt-4">
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
          </>
        )}
      </Card>
      <StepperNavigationButtons
        isLastStep={false}
        isFirstStep={false}
        onPrev={onBack}
        nextText={t('next')}
        submitText={t('finish')}
        onNext={currentChildStepIndex !== data.length ? onSubmit : undefined}
      />
    </>
  );
};

export default DynamicFormStep;
