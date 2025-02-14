'use client';

import { useState, useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRequest } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { OptionType } from '@/components/select/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { ChildSteps } from '@/components/stepper/child-steps';
import { ChildStepsProvider } from '@/components/stepper/child-steps-context';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AttachmentsStep, { attachmentSchema } from './attachments-step';
import CategoryStep, { combinedCategoriesSchema, CombinedCategoriesValues } from './category-step';
import DynamicFormStep, { formResponseSchema } from './dynamic-form-step';
import RequestDetailsStep, { requestDetailSchema } from './request-details-step';
import RequirementComplianceStep, { requirementComplianceSchema } from './requirement-compliance-step';
import SummaryStep from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'categories', label: 'Categories', schema: combinedCategoriesSchema },
  { id: 'requirementCompliance', label: 'Compliance', schema: requirementComplianceSchema },
  { id: 'requestDetails', label: 'Details', schema: requestDetailSchema },
  { id: 'attachments', label: 'Attachments', schema: attachmentSchema },
  { id: 'dynamicForm', label: 'Forms', schema: formResponseSchema },
  { id: 'summary', label: 'Summary', schema: z.object({}) }
);

export type RequestFormStepperType = z.infer<typeof combinedCategoriesSchema> &
  z.infer<typeof requirementComplianceSchema> &
  z.infer<typeof requestDetailSchema> &
  z.infer<typeof attachmentSchema> &
  z.infer<typeof formResponseSchema>;

type CombinedFormProps = {
  tenantId: string;
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
  statusesOptions: OptionType[];
  prioritiesOptions: OptionType[];
};

const RequestFormStepper: FC<CombinedFormProps> = ({ tenantId, requestLevelTypes, assignmentLevelTypes, statusesOptions, prioritiesOptions }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRequest();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  const [requestCategoryIds, setRequestCategoryIds] = useState<string[]>([]);

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    console.log('🚀 ~ onSubmit ~ values:', values);

    if (stepper.current.id === 'categories') {
      const data = values as CombinedCategoriesValues;
      if (data.requestCategory) {
        setRequestCategoryIds(data.requestCategory.map((category) => category.value));
      }
    }

    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as RequestFormStepperType;

      /* toast.promise(promise, {
        loading: 'Saving request...',
        success: (response) => {
          router.push({ pathname: '/admin/[tenantId]/security/roles', params: { tenantId } });
          return `Request saved: ${response?.id}`;
        },
        error: (error) => {
          return `Failed to save request: ${error.message}`;
        },
        position: 'top-right',
      });*/
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            <ChildStepsProvider initialSteps={{}}>
              <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo}>
                {(index, currentIndex) => <ChildSteps index={index} currentIndex={currentIndex} currentId={stepper.current.id} />}
              </StepNavigation>
              {error && <PrismaErrorAlert error={error} />}
              {stepper.switch({
                categories: () => <CategoryStep requestLevelTypes={requestLevelTypes} assignmentLevelTypes={assignmentLevelTypes} />,
                requirementCompliance: () => <RequirementComplianceStep requestCategoryIds={requestCategoryIds} />,
                requestDetails: () => <RequestDetailsStep statusesOptions={statusesOptions} prioritiesOptions={prioritiesOptions} />,
                attachments: () => <AttachmentsStep />,
                dynamicForm: () => <DynamicFormStep requestCategoryIds={requestCategoryIds} onNext={stepper.next} onPrev={stepper.prev} />,
                summary: () => <SummaryStep requestLevelTypes={requestLevelTypes} assignmentLevelTypes={assignmentLevelTypes} />,
              })}
            </ChildStepsProvider>
            {stepper.current.id !== 'dynamicForm' && (
              <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default RequestFormStepper;
