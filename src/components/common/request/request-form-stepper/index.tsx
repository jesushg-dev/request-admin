'use client';

import { useState, useTransition, type FC } from 'react';
import { upsertRequest } from '@/actions/request';
import { useRouter } from '@/i18n/routing';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { uploadFiles } from '@/lib/uploadthing';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { OptionType } from '@/components/custom-ui/select';
import { ChildSteps } from '@/components/stepper/child-steps';
import { ChildStepsProvider } from '@/components/stepper/child-steps-context';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import AttachmentsStep, { attachmentSchema, AttachmentsValues, getDefaultAttachmentsValues } from './attachments-step';
import CategoryStep, { combinedCategoriesSchema, CombinedCategoriesValues, getDefaultCombinedCategoriesValues } from './category-step';
import DynamicFormStep, { formResponseSchema, FormResponsesValues, getDefaultFormResponsesValues } from './dynamic-form-step';
import RequestDetailsStep, { getDefaultDetailsValues, requestDetailSchema, RequestDetailValues } from './request-details-step';
import RequirementComplianceStep, { getDefaultComplianceValues, requirementComplianceSchema, RequirementComplianceValues } from './requirement-compliance-step';
import SummaryStep from './summary-step';

const { useStepper, utils } = defineStepper(
  { id: 'classification', label: 'Classification', schema: combinedCategoriesSchema },
  { id: 'requirementCompliance', label: 'Compliance', schema: requirementComplianceSchema },
  { id: 'requestDetails', label: 'Details', schema: requestDetailSchema },
  { id: 'attachments', label: 'Attachments', schema: attachmentSchema },
  { id: 'dynamicForm', label: 'Forms', schema: formResponseSchema },
  { id: 'summary', label: 'Summary', schema: z.object({}) }
);

export type RequestFormStepperType = CombinedCategoriesValues & RequirementComplianceValues & RequestDetailValues & AttachmentsValues & FormResponsesValues;

type CombinedFormProps = {
  tenantId: string;
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
  statusesOptions: OptionType[];
  prioritiesOptions: OptionType[];
  defaultValues?: RequestFormStepperType;
};

const RequestFormStepper: FC<CombinedFormProps> = ({ defaultValues, tenantId, requestLevelTypes, assignmentLevelTypes, statusesOptions, prioritiesOptions }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const [requestCategoryIds, setRequestCategoryIds] = useState<string[]>([]);

  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ?? {
      ...getDefaultCombinedCategoriesValues(),
      ...getDefaultComplianceValues(),
      ...getDefaultDetailsValues(),
      ...getDefaultAttachmentsValues(),
      ...getDefaultFormResponsesValues(),
    },
  });

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    if (stepper.current.id === 'classification') {
      const data = values as CombinedCategoriesValues;
      if (data.requestCategory) {
        setRequestCategoryIds(data.requestCategory.map((category) => category.value));
      }
    }

    if (!stepper.isLast) {
      stepper.next();
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading('Saving request...');
      try {
        const data = form.getValues() as RequestFormStepperType;
        const response = await upsertRequest(tenantId, data);
        console.log('🚀 ~ startTransition ~ response:', response);

        if (data.additionalDocuments) {
          toast.loading('Uploading files to storage service', { id: toastId });
          await uploadFiles('imageUploader', {
            files: data.additionalDocuments,
            input: { tenantId, dataroomId: response.dataroomId },
            /*onUploadProgress: ({ file, progress }) => {
              //setProgresses((prev) => ({ ...prev, [file.name]: progress }));
            },*/
          });
        }

        router.push({ pathname: '/admin/[tenantId]/requests-portal/requests/[slug]', params: { tenantId, slug: response.id } });
        toast.success('Request created successfully', { id: toastId });
      } catch (error) {
        toast.error('Error creating request', { id: toastId });
        console.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden p-6">
            <ChildStepsProvider initialSteps={{}}>
              <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo}>
                {(index, currentIndex) => <ChildSteps index={index} currentIndex={currentIndex} currentId={stepper.current.id} />}
              </StepNavigation>
              {stepper.switch({
                classification: () => <CategoryStep requestLevelTypes={requestLevelTypes} assignmentLevelTypes={assignmentLevelTypes} />,
                requirementCompliance: () => <RequirementComplianceStep requestCategoryIds={requestCategoryIds} />,
                requestDetails: () => <RequestDetailsStep statusesOptions={statusesOptions} prioritiesOptions={prioritiesOptions} />,
                attachments: () => <AttachmentsStep />,
                dynamicForm: () => <DynamicFormStep requestCategoryIds={requestCategoryIds} onNext={stepper.next} onPrev={stepper.prev} />,
                summary: () => <SummaryStep tenantId={tenantId} requestLevelTypes={requestLevelTypes} assignmentLevelTypes={assignmentLevelTypes} />,
              })}
            </ChildStepsProvider>
            {stepper.current.id !== 'dynamicForm' && (
              <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default RequestFormStepper;
