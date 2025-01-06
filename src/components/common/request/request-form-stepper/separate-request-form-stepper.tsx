'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { categorySchema, HierarchyWithRelations } from '../../category/categories-select';
import AssignationCategoryStep from './assignation-category-step';
import DynamicFormStep from './dynamic-form-step';
import RequestCategoryStep from './request-category-step';
import RequestDetailsStep from './request-details-step';
import RequirementComplianceStep from './requirement-compliance-step';
import SummaryStep from './summary-step';

const requestCategorySchema = z.object({
  requestCategory: z.array(categorySchema),
});

const assignationCategorySchema = z.object({
  assignationCategory: z.array(categorySchema),
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

const { useStepper } = defineStepper(
  { id: 'requestCategory', label: 'Request Category', schema: requestCategorySchema },
  { id: 'assignationCategory', label: 'Assignation Category', schema: assignationCategorySchema },
  { id: 'requirementCompliance', label: 'Requirement Compliance', schema: separateFormSchema.shape.requirementCompliance },
  { id: 'requestDetails', label: 'Request Details', schema: separateFormSchema.shape.requestDetails },
  { id: 'dynamicForm', label: 'Dynamic Form', schema: separateFormSchema.shape.dynamicForm },
  { id: 'summary', label: 'Summary', schema: separateFormSchema }
);

type SeparateFormProps = {
  requestCategoryLevels: HierarchyWithRelations['levels'];
  assignationCategoryLevels: HierarchyWithRelations['levels'];
};

const SeparateRequestFormStepper: React.FC<SeparateFormProps> = ({ requestCategoryLevels, assignationCategoryLevels }) => {
  const stepper = useStepper();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  const onSubmit = (values: any) => {
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
        <StepNavigation steps={stepper.all} currentStepIndex={stepper.current.index} onStepClick={stepper.goTo} />
        {stepper.switch({
          requestCategory: () => <RequestCategoryStep requestCategoryLevels={requestCategoryLevels} />,
          assignationCategory: () => <AssignationCategoryStep assignationCategoryLevels={assignationCategoryLevels} />,
          requirementCompliance: () => <RequirementComplianceStep />,
          requestDetails: () => <RequestDetailsStep />,
          dynamicForm: () => <DynamicFormStep formElements={[]} />,
          summary: () => <SummaryStep />,
        })}
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onNext={stepper.next} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
};

export default SeparateRequestFormStepper;
