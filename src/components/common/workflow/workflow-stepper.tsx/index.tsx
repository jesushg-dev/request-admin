'use client';

import React, { useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRequestWorkflow } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import RequestTransitionForm, { workflowTransitionStateSchema } from './request-transition-form';
import RequestWorkflowForm, { getWorkflowDefaultValue, workflowFormSchema } from './request-workflow-form';

// Stepper definition
const { useStepper, utils } = defineStepper(
  { id: 'description', label: 'Description', schema: workflowFormSchema },
  { id: 'transitions', label: 'Transitions', schema: workflowTransitionStateSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

export type WorkflowFormStepperType = z.infer<typeof workflowFormSchema> & z.infer<typeof workflowTransitionStateSchema>;

interface WorkflowFormStepperProps {
  tenantId: string;
  defaultValues?: WorkflowFormStepperType;
}

// WorkflowFormStepper: Renders stepper and step content
const WorkflowFormStepper: FC<WorkflowFormStepperProps> = ({ tenantId, defaultValues }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRequestWorkflow();

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ? defaultValues : stepper.current.id === 'description' ? getWorkflowDefaultValue() : {},
  });

  // Handle form submission
  const onSubmit = (/*values: z.infer<typeof stepper.current.schema>*/) => {
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as WorkflowFormStepperType;

      const promise = upsert({
        create: {
          tenantId,
          name: data.name,
          description: data.description,
        },
        update: {
          tenantId,
          name: data.name,
          description: data.description,
        },
        where: { id: data.id, tenantId },
      });

      const upsertCategoriesPromise = promise.then((upsertResponse) => {
        if (!upsertResponse) {
          throw new Error('Failed to save area');
        }
      });

      toast.promise(Promise.all([promise, upsertCategoriesPromise]), {
        loading: 'Saving area...',
        success: ([upsertResponse]) => {
          router.push({ pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } });
          return `Workflow ${upsertResponse?.name} created successfully`;
        },
        error: (error) => {
          console.log('🚀 ~ toast.promise ~ error:', error);
          return `Failed to save area: ${error.message}`;
        },
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4" id="workflow-form-stepper">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            {error && <PrismaErrorAlert error={error} />}

            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />

            {/* Step Content */}
            {stepper.switch({
              description: () => (
                <div className="flex flex-1 overflow-y-hidden">
                  <ScrollArea className="w-full flex-1 overflow-y-hidden">
                    <RequestWorkflowForm />
                  </ScrollArea>
                </div>
              ),
              transitions: () => <RequestTransitionForm onBack={stepper.prev} />,
              finish: () => <div className="flex flex-col gap-4"></div>,
            })}

            {stepper.current.id !== 'transitions' && (
              <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default WorkflowFormStepper;
