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

const categoriesSchema = z.object({
  requestCategory: z.array(categorySchema),
  assignationCategory: z.array(categorySchema),
});

const requirementComplianceSchema = z.record(z.string(), z.boolean());

const requestDetailsSchema = z.object({
  clientId: z.string(),
  issueSubject: z.string().optional(),
  description: z.string().max(5000).optional(),
  priority: z.string().optional(),
  comment: z.string().max(255).optional(),
  statusId: z.string(),
});

const documentSchema = z.record(z.string(), z.instanceof(File).optional());

const formSchema = z.object({
  categories: categoriesSchema,
  requirementCompliance: requirementComplianceSchema,
  requestDetails: requestDetailsSchema,
  documents: documentSchema,
  dynamicForm: z.record(z.string(), z.any()).optional(), // Updated form schema
});

type FormValues = z.infer<typeof formSchema>;
const shouldSeparateSteps = 4;

const { useStepper, steps } = defineStepper(
  { id: 'requestCategory', label: 'Service Category', schema: categoriesSchema },
  ...(shouldSeparateSteps ? [{ id: 'assignationCategory', label: 'Assignation Category', schema: categoriesSchema }] : []),
  { id: 'requirementCompliance', label: 'Requirement Compliance', schema: requirementComplianceSchema },
  { id: 'requestDetails', label: 'Request Details', schema: requestDetailsSchema },
  { id: 'dynamicForm', label: 'Dynamic Form', schema: z.any().optional() }, // Added dynamic form step
  { id: 'summary', label: 'Summary', schema: formSchema }
);

type DynamicFormStepProps = {
  requestCategoryLevels: HierarchyWithRelations['levels'];
  assignationCategoryLevels: HierarchyWithRelations['levels'];
};

const RequestFormStepper: React.FC<DynamicFormStepProps> = ({ requestCategoryLevels, assignationCategoryLevels }) => {
  const stepper = useStepper();

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  // Handle form submission
  const onSubmit = (values: any) => {
    console.log(`Step: ${stepper.current.id}, Values:`, values);
    if (stepper.isLast) {
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  const dynamicFormElements = [
    { id: 'field1', type: 'text' as const, label: 'Field 1' },
    { id: 'field2', type: 'textarea' as const, label: 'Field 2' },
    { id: 'field3', type: 'select' as const, label: 'Field 3', options: ['Option 1', 'Option 2', 'Option 3'] },
  ];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden rounded-lg border p-6">
          <StepNavigation steps={stepper.all} currentStepIndex={stepper.current.index} onStepClick={stepper.goTo} />
          {/* Step Content */}
          <div className="flex flex-1 overflow-y-hidden">
            <ScrollArea className="w-full flex-1 overflow-y-hidden">
              {stepper.switch({
                requestCategory: () => <RequestCategoryStep requestCategoryLevels={requestCategoryLevels} />,
                ...(shouldSeparateSteps ? { assignationCategory: () => <AssignationCategoryStep assignationCategoryLevels={assignationCategoryLevels} /> } : {}),
                requirementCompliance: () => <RequirementComplianceStep />,
                requestDetails: () => <RequestDetailsStep />,
                dynamicForm: () => <DynamicFormStep formElements={dynamicFormElements} />, // Added DynamicFormStep
                summary: () => <SummaryStep />,
              })}
            </ScrollArea>
          </div>

          <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onNext={stepper.next} nextText="Next" submitText="Finish" />
        </form>
      </Form>
    </>
  );
};

export default RequestFormStepper;
