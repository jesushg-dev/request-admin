'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { createPlanWithFeatures } from '@/actions/plan';
import { getPlanFeatureSchema, getPlanInfoSchema, usePlanFeatureSchema, usePlanInfoSchema, type TPlanFeatureSchema, type TPlanInfoSchema } from '@/services/schemas/plan';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useForm } from 'react-hook-form';33
import { toast } from 'sonner';
import * as z from 'zod';

import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { PlanFeaturesStep } from './plan-feature-step';
import { PlanInfoStep } from './plan-step';
import { SummaryStep } from './summary-step';

const summarySchema = z.object({});

type PlanInfoFormValues = TPlanInfoSchema;
type PlanFeatureFormValues = TPlanFeatureSchema;

type Feature = {
  id: string;
  name: string;
  module: {
    id: string;
    name: string;
  };
};

interface PlanCreationFormProps {
  features: Feature[];
}

const { useStepper, utils } = defineStepper(
  { id: 'planInfo', label: 'steps.planInfo', schema: getPlanInfoSchema() },
  { id: 'planFeatures', label: 'steps.planFeatures', schema: getPlanFeatureSchema() },
  { id: 'summary', label: 'steps.summary', schema: summarySchema }
);

export default function PlanCreationForm({ features }: PlanCreationFormProps) {
  const stepper = useStepper();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('plans.form');
  const [planData, setPlanData] = useState<PlanInfoFormValues & PlanFeatureFormValues>({
    name: '',
    description: '',
    price: 0,
    features: [],
  });

  // Get internationalized schemas
  const planInfoSchemaIntl = usePlanInfoSchema();
  const planFeatureSchemaIntl = usePlanFeatureSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      planInfo: planInfoSchemaIntl,
      planFeatures: planFeatureSchemaIntl,
      summary: z.object({}),
    }),
    [planInfoSchemaIntl, planFeatureSchemaIntl]
  );

  // Create a custom resolver that dynamically selects the correct internationalized schema
  const dynamicResolver = useMemo(() => {
    return (values: any, context: any, options: any) => {
      const currentSchema = schemasMap[stepper.current.id as keyof typeof schemasMap] || stepper.current.schema;
      const resolver = zodResolver(currentSchema);
      return resolver(values, context, options);
    };
  }, [stepper.current.id, schemasMap]);

  const form = useForm({
    mode: 'onTouched',
    resolver: dynamicResolver,
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.current.id, form]);

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    setPlanData((prevData) => ({ ...prevData, ...values }));
    
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    // Submit the form on the last step
    startTransition(async () => {
      const finalData = { ...planData, ...values } as PlanInfoFormValues & PlanFeatureFormValues;
      const toastId = toast.loading(t('messages.saving'));
      
      try {
        await createPlanWithFeatures({
          name: finalData.name,
          description: finalData.description,
          price: finalData.price,
          durationInDays: finalData.durationInDays,
          features: finalData.features || [],
        });
        toast.success(t('messages.success'), { id: toastId });
        router.push('/admin/global/plans');
        router.refresh();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(t('messages.error', { error: errorMessage }), { id: toastId });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
        <StepNavigationModern t={t as (key: string) => string} steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full flex-1 overflow-y-hidden">
            {stepper.switch({
              planInfo: () => <PlanInfoStep />,
              planFeatures: () => <PlanFeaturesStep features={features} />,
              summary: () => <SummaryStep planData={planData} />,
            })}
          </ScrollArea>
        </div>
        <StepperNavigationButtons isPending={pending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} nextText="Next" submitText="Finish" />
      </form>
    </Form>
  );
}
