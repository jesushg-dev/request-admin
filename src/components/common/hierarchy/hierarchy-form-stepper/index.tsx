'use client';

import { useEffect, useMemo, useTransition, type FC } from 'react';
import { getHierarchySchema, getLevelsSchema, useHierarchySchema, useLevelsSchema, type THierarchySchema, type TLevelsSchema } from '@/services/schemas/hierarchy';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { Locale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { getDefaultHierarchyFormValues, HierarchyForm } from '../hierarchy-form';
import { LevelsStep } from './levels-step';
import { SummaryStep } from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'hierarchy', label: 'steps.hierarchy', schema: getHierarchySchema() },
  { id: 'levels', label: 'steps.levels', schema: getLevelsSchema() },
  { id: 'summary', label: 'steps.summary', schema: z.object({}) }
);

export type HierarchyFormStepperValues = THierarchySchema & TLevelsSchema;

interface HierarchyFormStepperProps {
  tenantId: string;
  isInUse?: boolean;
  locale: Locale;
  defaultValues?: HierarchyFormStepperValues;
  upsertAction: (values: HierarchyFormStepperValues, tenantId: string, locale: Locale) => Promise<void>;
}

const HierarchyFormStepper: FC<HierarchyFormStepperProps> = ({ tenantId, locale, defaultValues, isInUse = false, upsertAction }) => {
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('admin.hierarchy');

  // Get internationalized schemas
  const hierarchySchemaIntl = useHierarchySchema();
  const levelsSchemaIntl = useLevelsSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      hierarchy: hierarchySchemaIntl,
      levels: levelsSchemaIntl,
      summary: z.object({}),
    }),
    [hierarchySchemaIntl, levelsSchemaIntl]
  );

  // Create a custom resolver that dynamically selects the correct internationalized schema
  // based on the current step. This allows us to use internationalized schemas even though
  // defineStepper requires static schemas.
  const dynamicResolver = useMemo(() => {
    return (values: any, context: any, options: any) => {
      const currentSchema = schemasMap[stepper.current.id as keyof typeof schemasMap] || stepper.current.schema;
      const resolver = zodResolver(currentSchema);
      return resolver(values, context, options);
    };
  }, [stepper.current.id, schemasMap]);

  const form = useForm({
    resolver: dynamicResolver,
    defaultValues: defaultValues ?? {
      ...getDefaultHierarchyFormValues(),
    },
  });

  // Clear errors when step changes to ensure clean validation state
  useEffect(() => {
    form.clearErrors();
  }, [stepper.current.id, form]);

  const onSubmit = () => {
    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const data = form.getValues() as HierarchyFormStepperValues;
      const promise = upsertAction(data, tenantId, locale);

      toast.promise(promise, {
        loading: t('messages.saving'),
        success: () => t('messages.success'),
        error: (error) => t('messages.error', { error: error.message }),
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <StepNavigationModern t={t as typeof t & ((key: string) => string)} steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
          {stepper.switch({
            hierarchy: () => <HierarchyForm />,
            levels: () => <LevelsStep isInUse={isInUse} />,
            summary: () => <SummaryStep />,
          })}
          <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
        </form>
      </Form>
    </div>
  );
};

export { HierarchyFormStepper };
