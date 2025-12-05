'use client';

import { useEffect, useMemo, useState, useTransition, type FC } from 'react';
import { upsertRequest } from '@/actions/request';
import { useRouter } from '@/i18n/routing';
import { getRequestDetailSchema, useRequestDetailSchema, type TRequestDetailSchema } from '@/services/schemas/request';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { uploadFiles } from '@/lib/uploadthing';
import { Form } from '@/components/ui/form';
import { OptionType } from '@/components/custom-ui/select';
import { ChildSteps } from '@/components/stepper/child-steps';
import { ChildStepsProvider } from '@/components/stepper/child-steps-context';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AttachmentsStep, { attachmentSchema, AttachmentsValues, getDefaultAttachmentsValues } from './attachments-step';
import ClassificationStep, { combinedCategoriesSchema, CombinedCategoriesValues, getDefaultCombinedCategoriesValues } from './classification-step';
import DynamicFormStep, { formResponseSchema, FormResponsesValues, getDefaultFormResponsesValues } from './dynamic-form-step';
import RequestDetailsStep, { getDefaultDetailsValues } from './request-details-step';
import RequirementComplianceStep, { getDefaultComplianceValues, requirementComplianceSchema, RequirementComplianceValues } from './requirement-compliance-step';
import SummaryStep from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'classification', label: 'classification', schema: combinedCategoriesSchema },
  { id: 'requirementCompliance', label: 'compliance', schema: requirementComplianceSchema },
  { id: 'requestDetails', label: 'details', schema: getRequestDetailSchema() },
  { id: 'attachments', label: 'attachments', schema: attachmentSchema },
  { id: 'dynamicForm', label: 'forms', schema: formResponseSchema },
  { id: 'summary', label: 'summary', schema: z.object({}) }
);

export type RequestFormStepperType = CombinedCategoriesValues & RequirementComplianceValues & TRequestDetailSchema & AttachmentsValues & FormResponsesValues;

type CategoryIds = {
  requestCategory: string[];
  assignmentCategory: string[];
};

interface CombinedFormProps {
  tenantId: string;
  prioritiesOptions: OptionType[];
  defaultValues?: RequestFormStepperType;
}

const RequestFormStepper: FC<CombinedFormProps> = ({ defaultValues, tenantId, prioritiesOptions }) => {
  const t = useTranslations('admin.request.form');
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const [isDraftRemovable, setIsDraftRemovable] = useState(false);
  const [categoryIds, setCategoryIds] = useState<CategoryIds>({ requestCategory: [], assignmentCategory: [] });

  // Get internationalized schema for request details
  const requestDetailSchemaIntl = useRequestDetailSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      classification: combinedCategoriesSchema,
      requirementCompliance: requirementComplianceSchema,
      requestDetails: requestDetailSchemaIntl,
      attachments: attachmentSchema,
      dynamicForm: formResponseSchema,
      summary: z.object({}),
    }),
    [requestDetailSchemaIntl]
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
    defaultValues: defaultValues ?? {
      ...getDefaultCombinedCategoriesValues(),
      ...getDefaultComplianceValues(),
      ...getDefaultDetailsValues(),
      ...getDefaultAttachmentsValues(),
      ...getDefaultFormResponsesValues(),
    },
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.current.id, form]);
  console.log(form.formState.errors);

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    if (stepper.current.id === 'classification') {
      const data = values as CombinedCategoriesValues;
      if (data.requestCategory && data.assignmentCategory) {
        setCategoryIds({
          requestCategory: data.requestCategory.map((category) => category.value),
          assignmentCategory: data.assignmentCategory.map((category) => category.value),
        });
      }
    }

    if (stepper.current.id === 'requirementCompliance') {
      const data = values as RequirementComplianceValues;
      const allRequirements = Object.values(data.requirementCompliances).every((value) => value === true);
      setIsDraftRemovable(allRequirements);
    }

    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading(t('savingRequest'));
      try {
        const data = form.getValues() as RequestFormStepperType;
        const response = await upsertRequest(tenantId, data);
        if (data.additionalDocuments) {
          if (data.additionalDocuments.length > 0) {
            toast.loading(t('uploadingFiles'), { id: toastId });
            await uploadFiles('imageUploader', {
              files: data.additionalDocuments,
              input: { tenantId, dataroomId: response.dataroomId },
              /*onUploadProgress: ({ file, progress }) => {
              //setProgresses((prev) => ({ ...prev, [file.name]: progress }));
            },*/
            });
          }
        }

        router.push({ pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug: response.id } });
        toast.success(t('requestCreatedSuccessfully'), { id: toastId });
      } catch (error) {
        toast.error(t('errorCreatingRequest'), { id: toastId });
        console.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <ChildStepsProvider initialSteps={{}}>
        <StepNavigationModern t={t as (key: string) => string} steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo}>
          {(index, currentIndex) => <ChildSteps index={index} currentIndex={currentIndex} currentId={stepper.current.id} />}
        </StepNavigationModern>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
            {stepper.switch({
              classification: () => <ClassificationStep />,
              requirementCompliance: () => <RequirementComplianceStep requestCategoryIds={categoryIds.requestCategory} />,
              requestDetails: () => <RequestDetailsStep isDraftRemovable={isDraftRemovable} prioritiesOptions={prioritiesOptions} />,
              attachments: () => <AttachmentsStep />,
              dynamicForm: () => (
                <DynamicFormStep assignmentCategoryIds={categoryIds.assignmentCategory} requestCategoryIds={categoryIds.requestCategory} onNext={stepper.next} onPrev={stepper.prev} />
              ),
              summary: () => <SummaryStep tenantId={tenantId} />,
            })}
            {stepper.current.id !== 'dynamicForm' && (
              <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
            )}
          </form>
        </Form>
      </ChildStepsProvider>
    </div>
  );
};

export default RequestFormStepper;
