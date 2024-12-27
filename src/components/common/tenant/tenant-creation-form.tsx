'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { ModulesForm } from './module-form';
import { PlanSelectionForm } from './plan-selection-form';
import { TenantForm } from './tenant-form';
import { Module, modulesSchema, Plan, planSelectionSchema, tenantDetailsSchema, TenantFormData } from './types';

interface TenantCreationFormProps {
  modules: Module[];
  plans: Plan[];
  onSubmit: (data: TenantFormData) => Promise<void>;
}

const { useStepper, steps } = defineStepper(
  { id: 'tenant', label: 'Tenant Details', schema: tenantDetailsSchema },
  { id: 'modules', label: 'Modules', schema: modulesSchema },
  { id: 'plan', label: 'Plan Selection', schema: planSelectionSchema }
);

export function TenantCreationForm({ modules, plans, onSubmit }: TenantCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stepper = useStepper();

  const form = useForm<TenantFormData>({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      modules: modules.map((module) => ({ ...module, isActive: false })),
    },
  });

  const handleSubmit = async (values: TenantFormData) => {
    if (stepper.isLast) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Tenant</h2>
          <span className="text-sm text-muted-foreground">
            Step {stepper.current.index + 1} of {steps.length}
          </span>
        </div>

        <nav aria-label="Tenant Creation Steps" className="my-4">
          <ol className="flex items-center justify-between gap-2">
            {stepper.all.map((step, index, array) => (
              <li key={step.id} className="flex flex-shrink-0 items-center gap-4">
                <Button
                  type="button"
                  role="tab"
                  variant={index <= stepper.current.index ? 'default' : 'secondary'}
                  aria-current={stepper.current.id === step.id ? 'step' : undefined}
                  className="flex size-10 items-center justify-center rounded-full"
                  onClick={() => stepper.goTo(step.id)}>
                  {index + 1}
                </Button>
                <span className="text-sm font-medium">{step.label}</span>
                {index < array.length - 1 && <Separator className={`flex-1 ${index < stepper.current.index ? 'bg-primary' : 'bg-muted'}`} />}
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-6">
          {stepper.switch({
            tenant: () => <TenantForm />,
            modules: () => <ModulesForm modules={modules} />,
            plan: () => <PlanSelectionForm plans={plans} />,
          })}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={stepper.prev} disabled={stepper.isFirst}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {stepper.isLast ? 'Create Tenant' : 'Next'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
