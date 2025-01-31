'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AssignmentCategoryStep, { combinedCategoriesSchema } from './assignment-category-step';
import DynamicFormStep from './dynamic-form-step';
import RequestDetailsStep from './request-details-step';
import RequirementComplianceStep from './requirement-compliance-step';
import SummaryStep from './summary-step';

const combinedFormSchema = z.object({
  requirementCompliance: z.record(z.string(), z.boolean()),
  requestDetails: z.object({
    clientId: z.string(),
    issueSubject: z.string().optional(),
    description: z.string().max(5000).optional(),
    priority: z.string().optional(),
    comment: z.string().max(255).optional(),
    statusId: z.string(),
  }),
  documents: z.record(z.string(), z.instanceof(File).optional()),
  dynamicForm: z.record(z.string(), z.any()).optional(),
});

const { useStepper, utils } = defineStepper(
  { id: 'categories', label: 'Categories', schema: combinedCategoriesSchema },
  { id: 'requirementCompliance', label: 'Requirement Compliance', schema: combinedFormSchema.shape.requirementCompliance },
  { id: 'requestDetails', label: 'Request Details', schema: combinedFormSchema.shape.requestDetails },
  { id: 'dynamicForm', label: 'Dynamic Form', schema: combinedFormSchema.shape.dynamicForm },
  { id: 'summary', label: 'Summary', schema: combinedFormSchema }
);

type CombinedFormProps = {
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
};

const CombinedRequestFormStepper: React.FC<CombinedFormProps> = ({ requestLevelTypes, assignmentLevelTypes }) => {
  const stepper = useStepper();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });
  console.log('🚀 ~ form:', form.formState.errors);

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
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
              categories: () => (
                <ScrollArea>
                  <div className="w-full flex flex-col gap-4 px-1">
                    <AssignmentCategoryStep requestLevelTypes={requestLevelTypes} assignmentLevelTypes={assignmentLevelTypes} />
                  </div>
                </ScrollArea>
              ),
              requirementCompliance: () => <RequirementComplianceStep />,
              requestDetails: () => <RequestDetailsStep />,
              dynamicForm: () => <DynamicFormStep formElements={[]} />,
              summary: () => <SummaryStep />,
            })}
            <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CombinedRequestFormStepper;
