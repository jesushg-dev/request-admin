'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { PlanFeaturesStep } from './plan-feature-step';
import { PlanInfoStep } from './plan-step';
import { planFeatureSchema, planInfoSchema } from './schemas';
import { SummaryStep } from './summary-step';

const summarySchema = z.object({});

type PlanInfoFormValues = z.infer<typeof planInfoSchema>;
type PlanFeatureFormValues = z.infer<typeof planFeatureSchema>;

const { useStepper, utils } = defineStepper(
  { id: 'planInfo', label: 'plans.form.steps.planInfo', schema: planInfoSchema },
  { id: 'planFeatures', label: 'plans.form.steps.planFeatures', schema: planFeatureSchema },
  { id: 'summary', label: 'plans.form.steps.summary', schema: summarySchema }
);

export default function PlanCreationForm() {
  const stepper = useStepper();
  const t = useTranslations('plans.form');
  const [planData, setPlanData] = useState<PlanInfoFormValues & PlanFeatureFormValues>({
    name: '',
    description: '',
    price: 0,
    features: [],
  });

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    console.log(`Form values for step ${stepper.current.id}:`, values);
    setPlanData((prevData) => ({ ...prevData, ...values }));
    if (stepper.isLast) {
      console.log('Final plan data:', planData);
      // Here you would typically send the data to your backend
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
        <StepNavigationModern t={t as (key: string) => string} steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full flex-1 overflow-y-hidden">
            {stepper.switch({
              planInfo: () => <PlanInfoStep />,
              planFeatures: () => <PlanFeaturesStep />,
              summary: () => <SummaryStep planData={planData} />,
            })}
          </ScrollArea>
        </div>
        <StepperNavigationButtons isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
}
