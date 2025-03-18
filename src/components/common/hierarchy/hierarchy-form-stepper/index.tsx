'use client';

import { useTransition, type FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { getDefaultHierarchyFormValues, HierarchyForm, hierarchySchema } from '../hierarchy-form';
import { levelsSchema, LevelsStep } from './levels-step';
import { SummaryStep } from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'hierarchy', label: 'Hierarchy', schema: hierarchySchema },
  { id: 'levels', label: 'Levels', schema: levelsSchema },
  { id: 'summary', label: 'Summary', schema: z.object({}) }
);

export type HierarchyFormStepperValues = z.infer<typeof hierarchySchema> & z.infer<typeof levelsSchema>;

interface HierarchyFormStepperProps {
  tenantId: string;
  isInUse?: boolean;
  defaultValues?: HierarchyFormStepperValues;
  upsertAction: (values: HierarchyFormStepperValues, tenantId: string) => Promise<HierarchyFormStepperValues>;
}

const HierarchyFormStepper: FC<HierarchyFormStepperProps> = ({ tenantId, defaultValues, isInUse = false, upsertAction }) => {
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ?? {
      ...getDefaultHierarchyFormValues(),
    },
  });

  const onSubmit = () => {
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as HierarchyFormStepperValues;
      const promise = upsertAction(data, tenantId);

      toast.promise(promise, {
        loading: 'Saving hierarchy...',
        success: (responses) => {
          return `Hierarchy ${responses.name} saved successfully!`;
        },
        error: (error) => {
          return `Failed to save hierarchy: ${error.message}`;
        },
      });
    });
  };

  return (
    <Card className="w-full flex flex-col flex-1 overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
          <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
          <div className="flex flex-1 overflow-y-hidden">
            {stepper.switch({
              hierarchy: () => <HierarchyForm />,
              levels: () => <LevelsStep isInUse={isInUse} />,
              summary: () => <SummaryStep />,
            })}
          </div>
          <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
        </form>
      </Form>
    </Card>
  );
};

export { HierarchyFormStepper };
