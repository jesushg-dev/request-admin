'use client';

import { useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { getTenantFormDefaultValues, TenantFormFields, tenantFormSchema } from '../tenant-form';
import { Plan, planSelectionSchema, PlanSelectionStep } from './plan-selection-step';
import TenantReviewStep from './tenant-review-step';

const { useStepper, utils } = defineStepper(
  { id: 'tenant', label: 'Tenant Details', schema: tenantFormSchema },
  { id: 'plan', label: 'Plan Selection', schema: planSelectionSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

export type TenantCreationValues = z.infer<typeof tenantFormSchema> & z.infer<typeof planSelectionSchema>;

interface TenantCreationFormProps {
  plans: Plan[];
}

export function TenantCreationForm({ plans }: TenantCreationFormProps) {
  const stepper = useStepper();
  const [pending, startTransition] = useTransition();

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      ...getTenantFormDefaultValues(),
    },
  });

  // Handle form submission
  const onSubmit = async () => {
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    // Submit the form
    startTransition(async () => {
      const data = form.getValues() as TenantCreationValues;
      const toastId = toast.loading('Creating organization...');
      await authClient.organization.create(
        {
          name: data.name,
          slug: data.slug,
          logo: data.logo,
        },
        {
          onSuccess: () => {
            toast.success('Organization created successfully', { id: toastId });
          },
          onError: ({ error }) => {
            toast.error('Failed to create organization: ' + error.message, { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
          <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
          <div className="flex flex-1 overflow-y-hidden ">
            <ScrollArea className="w-full flex-1 overflow-y-hidden">
              {stepper.switch({
                tenant: () => <TenantFormFields />,
                plan: () => <PlanSelectionStep plans={plans} />,
                finish: () => <TenantReviewStep plans={plans} />,
              })}
            </ScrollArea>
          </div>
          <StepperNavigationButtons isPending={pending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
        </form>
      </Form>
    </div>
  );
}
