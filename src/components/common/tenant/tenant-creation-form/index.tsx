'use client';

import { useEffect, useMemo, useTransition } from 'react';
import { createTenantWithInitialization } from '@/actions/tenant';
import { useRouter } from '@/i18n/routing';
import { useTenantFormSchema } from '@/services/schemas/tenant';
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

import { BrandingStep } from './branding-step';
import { OrganizationStep } from './organization-step';
import { Plan, planSelectionSchema, PlanSelectionStep } from './plan-selection-step';
import { brandingSchema, organizationSchema } from './schemas';
import TenantReviewStep from './tenant-review-step';

const { useStepper, utils } = defineStepper(
  { id: 'organization', label: 'steps.organization', schema: organizationSchema },
  { id: 'branding', label: 'steps.branding', schema: brandingSchema },
  { id: 'plan', label: 'steps.plan', schema: planSelectionSchema },
  { id: 'finish', label: 'steps.finish', schema: z.object({}) }
);

export type TenantCreationValues = z.infer<typeof organizationSchema> & z.infer<typeof brandingSchema> & z.infer<typeof planSelectionSchema>;

interface TenantCreationFormProps {
  plans: Plan[];
  isGlobalAdmin?: boolean;
}

export function TenantCreationForm({ plans, isGlobalAdmin = false }: TenantCreationFormProps) {
  const stepper = useStepper();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations('tenants.form');

  // Get internationalized schema for tenant form (for validation)
  const tenantFormSchemaIntl = useTenantFormSchema();

  // Create a map of step IDs to schemas
  // For organization step, we'll validate only organization fields from the full schema
  const schemasMap = useMemo(
    () => ({
      organization: tenantFormSchemaIntl.pick({
        name: true,
        slug: true,
        logo: true,
        websiteUrl: true,
        title: true,
        description: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
      }),
      branding: tenantFormSchemaIntl.pick({
        primaryColor: true,
        secondaryColor: true,
      }),
      plan: planSelectionSchema,
      finish: z.object({}),
    }),
    [tenantFormSchemaIntl]
  );

  // Create a custom resolver that dynamically selects the correct schema
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
      name: '',
      slug: '',
      logo: '',
      websiteUrl: '',
      title: '',
      description: '',
      primaryColor: '',
      secondaryColor: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      planId: '',
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

      try {
        const tenant = await createTenantWithInitialization({
          name: data.name,
          slug: data.slug,
          logo: data.logo,
          websiteUrl: data.websiteUrl,
          title: data.title,
          description: data.description,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          address: data.address,
          planId: data.planId,
        });

        toast.success(t('messages.success'), { id: toastId });

        // Optionally redirect to the new tenant
        router.push('/admin');
      } catch (error) {
        console.log('error', error);
        console.log('error stringified', JSON.stringify(error));
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(t('messages.error', { error: errorMessage }), { id: toastId });
      }
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
                organization: () => <OrganizationStep />,
                branding: () => <BrandingStep />,
                plan: () => <PlanSelectionStep plans={plans} isGlobalAdmin={isGlobalAdmin} />,
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
