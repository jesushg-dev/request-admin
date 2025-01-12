'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { Form } from '@/components/ui/form';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { assignationCategorySelectSchema } from '../../category/assignation-categories-select';
import { requestCategorySelectSchema } from '../../category/request-categories-select';
import AssignationCategoryStep from './assignation-category-step';
import DynamicFormStep from './dynamic-form-step';
import RequestCategoryStep from './request-category-step';
import RequestDetailsStep from './request-details-step';
import RequirementComplianceStep from './requirement-compliance-step';
import SummaryStep from './summary-step';

const requestCategorySchema = z.object({
  requestCategory: z.array(requestCategorySelectSchema),
});

const assignationCategorySchema = z.object({
  assignationCategory: z.array(assignationCategorySelectSchema),
});

const separateFormSchema = z.object({
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
  { id: 'requestCategory', label: 'Request Category', schema: requestCategorySchema },
  { id: 'assignationCategory', label: 'Assignation Category', schema: assignationCategorySchema },
  { id: 'requirementCompliance', label: 'Requirement Compliance', schema: separateFormSchema.shape.requirementCompliance },
  { id: 'requestDetails', label: 'Request Details', schema: separateFormSchema.shape.requestDetails },
  { id: 'dynamicForm', label: 'Dynamic Form', schema: separateFormSchema.shape.dynamicForm },
  { id: 'summary', label: 'Summary', schema: separateFormSchema }
);

type SeparateFormProps = {
  requestLevels: RequestLevelType[];
  assignmentLevels: AssignmentLevelType[];
};

const SeparateRequestFormStepper: React.FC<SeparateFormProps> = ({ requestLevels, assignmentLevels }) => {
  const stepper = useStepper();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    if (stepper.isLast) {
      console.log('Final Form Values:', values);
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden rounded-lg border p-6">
        <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
        {stepper.switch({
          requestCategory: () => <RequestCategoryStep levels={requestLevels} />,
          assignationCategory: () => <AssignationCategoryStep levels={assignmentLevels} />,
          requirementCompliance: () => <RequirementComplianceStep />,
          requestDetails: () => <RequestDetailsStep />,
          dynamicForm: () => <DynamicFormStep formElements={[]} />,
          summary: () => <SummaryStep />,
        })}
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
};

export default SeparateRequestFormStepper;
