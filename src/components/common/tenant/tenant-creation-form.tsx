'use client';

import React, { Fragment, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
        <nav aria-label="Steps">
          <ol className="flex items-center gap-x-4">
            {stepper.all.map((step, index, array) => (
              <Fragment key={step.id}>
                <li className="flex items-center gap-x-2">
                  <Button type="button" variant={index <= stepper.current.index ? 'default' : 'outline'} className="size-8 rounded-full p-0" onClick={() => stepper.goTo(step.id)}>
                    {index + 1}
                  </Button>
                  <span className="text-xs font-medium">{step.label}</span>
                </li>
                {index < array.length - 1 && <Separator className={`flex-1 ${index < stepper.current.index ? 'bg-primary' : 'bg-muted'}`} />}
              </Fragment>
            ))}
          </ol>
        </nav>

        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full overflow-y-auto pl-2 pr-4">
            {stepper.switch({
              tenant: () => <TenantForm />,
              modules: () => <ModulesForm modules={modules} />,
              plan: () => <PlanSelectionForm plans={plans} />,
            })}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={stepper.prev} disabled={stepper.isFirst}>
            Back
          </Button>
          <Button type="submit">{stepper.isLast ? 'Finish' : 'Next'}</Button>
        </div>
      </form>
    </Form>
  );
}
