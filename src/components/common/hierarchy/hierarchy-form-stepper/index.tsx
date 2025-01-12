'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { HierarchyStep } from './hierarchy-step';
import { LevelsStep } from './levels-step';
import { HierarchyFormValues, hierarchySchema, levelsSchema, summarySchema } from './schemas';
import { SummaryStep } from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'hierarchy', label: 'Hierarchy', schema: hierarchySchema },
  { id: 'levels', label: 'Levels', schema: levelsSchema },
  { id: 'summary', label: 'Summary', schema: summarySchema }
);

export function HierarchyFormStepper() {
  const stepper = useStepper();

  const form = useForm<HierarchyFormValues>({
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      name: '',
      description: '',
      type: undefined,
      levels: [{ name: '' }],
    },
  });

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    console.log(`Form values for step ${stepper.current.id}:`, values);
    if (stepper.isLast) {
      console.log('Final form data:', form.getValues());
      // Here you would typically send the data to your API
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden rounded-lg border p-6">
        <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full flex-1 overflow-y-hidden">
            {stepper.switch({
              hierarchy: () => <HierarchyStep />,
              levels: () => <LevelsStep />,
              summary: () => <SummaryStep />,
            })}
          </ScrollArea>
        </div>
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
}
