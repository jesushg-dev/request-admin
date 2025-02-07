'use client';

import { useState, type FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import CategoryStep, { combinedCategoriesSchema, CombinedCategoriesValues } from './category-step';
import DynamicFormStep, { dynamicFormSchema } from './dynamic-form-step';
import RequestDetailsStep, { requestDetailSchema } from './request-details-step';
import RequirementComplianceStep, { requirementComplianceSchema } from './requirement-compliance-step';
import SummaryStep from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'categories', label: 'Categories', schema: combinedCategoriesSchema },
  { id: 'requirementCompliance', label: 'Requirement Compliance', schema: requirementComplianceSchema },
  { id: 'requestDetails', label: 'Request Details', schema: requestDetailSchema },
  { id: 'dynamicForm', label: 'Dynamic Form', schema: dynamicFormSchema },
  { id: 'summary', label: 'Summary', schema: z.object({}) }
);

type CombinedFormProps = {
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
};

const RequestFormStepper: FC<CombinedFormProps> = ({ requestLevelTypes, assignmentLevelTypes }) => {
  const stepper = useStepper();

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

    if (stepper.isLast) {
      console.log('Final Form Values:', values);
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
            {stepper.switch({
              categories: () => <CategoryStep requestLevelTypes={requestLevelTypes} assignmentLevelTypes={assignmentLevelTypes} />,
              requirementCompliance: () => <RequirementComplianceStep requestCategoryIds={requestCategoryIds} />,
              requestDetails: () => <RequestDetailsStep />,
              dynamicForm: () => <DynamicFormStep requestCategoryIds={requestCategoryIds} />,
              summary: () => <SummaryStep />,
            })}
            <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default RequestFormStepper;
