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
import { SummaryStep } from './summary-step';

const hierarchySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(255, 'Description must be 255 characters or less').optional(),
  type: z.enum(['Request', 'Assignation'], {
    required_error: 'Please select a hierarchy type',
  }),
});

const levelsSchema = z.object({
  levels: z
    .array(
      z.object({
        name: z.string().min(1, 'Level name is required').max(100, 'Level name must be 100 characters or less'),
      })
    )
    .min(1, 'At least one hierarchy level is required'),
});

const summarySchema = z.object({});

const { useStepper, steps } = defineStepper(
  { id: 'hierarchy', label: 'Hierarchy', schema: hierarchySchema },
  { id: 'levels', label: 'Levels', schema: levelsSchema },
  { id: 'summary', label: 'Summary', schema: summarySchema }
);

export type HierarchyFormValues = z.infer<typeof hierarchySchema> & z.infer<typeof levelsSchema>;

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
        <StepNavigation steps={stepper.all} currentStepIndex={stepper.current.index} onStepClick={stepper.goTo} />
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full">
            {stepper.switch({
              hierarchy: () => <HierarchyStep />,
              levels: () => <LevelsStep />,
              summary: () => <SummaryStep />,
            })}
          </ScrollArea>
        </div>
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onNext={stepper.next} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
}
