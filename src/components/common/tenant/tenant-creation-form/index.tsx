'use client';

import { useEffect, useMemo, useTransition } from 'react';
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
import { useTenantFormSchema } from '@/services/schemas/tenant';

import { getTenantFormDefaultValues, TenantFormFields, getTenantFormSchema } from '../tenant-form';
import { Plan, planSelectionSchema, PlanSelectionStep } from './plan-selection-step';
import TenantReviewStep from './tenant-review-step';

const { useStepper, utils } = defineStepper(
  { id: 'tenant', label: 'steps.tenant', schema: getTenantFormSchema() },
  { id: 'plan', label: 'steps.plan', schema: planSelectionSchema },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type TenantCreationValues = z.infer<ReturnType<typeof getTenantFormSchema>> & z.infer<typeof planSelectionSchema>;

interface TenantCreationFormProps {
  plans: Plan[];
}

export function TenantCreationForm({ plans }: TenantCreationFormProps) {
  const stepper = useStepper();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('tenants.form');

  // Get internationalized schema for tenant form
  const tenantFormSchemaIntl = useTenantFormSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      tenant: tenantFormSchemaIntl,
      plan: planSelectionSchema,
      finish: z.object({}),
    }),
    [tenantFormSchemaIntl]
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
    defaultValues: {
      ...getTenantFormDefaultValues(),
    },
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.current.id, form]);

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
