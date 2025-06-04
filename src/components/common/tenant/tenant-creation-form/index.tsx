'use client';

import { useTransition } from 'react';
import { authClient } from '@/server/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { getTenantFormDefaultValues, TenantFormFields, tenantFormSchema } from '../tenant-form';
import { Plan, planSelectionSchema, PlanSelectionStep } from './plan-selection-step';
import TenantReviewStep from './tenant-review-step';

const { useStepper, utils } = defineStepper(
  { id: 'tenant', label: 'steps.tenant', schema: tenantFormSchema },
  { id: 'plan', label: 'steps.plan', schema: planSelectionSchema },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type TenantCreationValues = z.infer<typeof tenantFormSchema> & z.infer<typeof planSelectionSchema>;

interface TenantCreationFormProps {
  plans: Plan[];
}

export function TenantCreationForm({ plans }: TenantCreationFormProps) {
  const stepper = useStepper();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('tenants.form');

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
      const toastId = toast.loading(t('messages.saving'));
      await authClient.organization.create(
        {
          name: data.name,
          slug: data.slug,
          logo: data.logo,
        },
        {
          onSuccess: () => {
            toast.success(t('messages.success'), { id: toastId });
          },
          onError: ({ error }) => {
            toast.error(t('messages.error', { error: error.message }), { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
      <StepNavigationModern t={t as typeof t & ((key: string) => string)} steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
          <div className="flex flex-1 overflow-y-hidden">
            <ScrollArea className="w-full flex-1 overflow-y-hidden">
              {stepper.switch({
                tenant: () => <TenantFormFields />,
                plan: () => <PlanSelectionStep plans={plans} />,
                finish: () => <TenantReviewStep plans={plans} />,
              })}
            </ScrollArea>
          </div>
          <StepperNavigationButtons isPending={pending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
        </form>
      </Form>
    </div>
  );
}
