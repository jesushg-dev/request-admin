'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { ModulesForm } from './module-form';
import { PlanSelectionForm } from './plan-selection-form';
import { TenantForm } from './tenant-form';
import { Module, modulesSchema, Plan, planSelectionSchema, tenantDetailsSchema, TenantFormData } from './types';

interface TenantCreationFormProps {
  modules: Module[];
  plans: Plan[];
}

const { useStepper, steps } = defineStepper(
  { id: 'tenant', label: 'Tenant Details', schema: tenantDetailsSchema },
  { id: 'modules', label: 'Modules', schema: modulesSchema },
  { id: 'plan', label: 'Plan Selection', schema: planSelectionSchema }
);

export function TenantCreationForm({ modules, plans }: TenantCreationFormProps) {
  const stepper = useStepper();

  const form = useForm<TenantFormData>({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      modules: modules.map((module) => ({ ...module, isActive: false })),
    },
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden rounded-lg border p-6">
        <StepNavigation steps={stepper.all} currentStepIndex={stepper.current.index} onStepClick={stepper.goTo} />
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full overflow-y-auto pl-2 pr-4">
            {stepper.switch({
              tenant: () => <TenantForm />,
              modules: () => <ModulesForm modules={modules} />,
              plan: () => <PlanSelectionForm plans={plans} />,
            })}
          </ScrollArea>
        </div>
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onNext={stepper.next} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
}
