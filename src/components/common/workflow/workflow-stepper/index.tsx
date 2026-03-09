'use client';

import React, { useEffect, useMemo, useState, useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRequestWorkflow } from '@/services/api/hooks';
import { getWorkflowSchema, useWorkflowSchema, type TWorkflowSchema } from '@/services/schemas/workflow';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { ReactFlowProvider } from '@xyflow/react';
import { omit, pick } from 'lodash';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { RequestFlowDiagramEditor, type WorkflowData } from './flow-diagram-editor';
import RequestWorkflowForm, { getWorkflowDefaultValue } from './request-workflow-form';
import WorkflowReview from './workflow-review';

// Stepper definition
const { useStepper } = defineStepper(
  { id: 'description', label: 'steps.description', schema: getWorkflowSchema() },
  { id: 'transitions', label: 'steps.transitions', schema: z.object({}) },
  { id: 'finish', label: 'steps.review', schema: z.object({}) }
);

export type WorkflowFormStepperType = TWorkflowSchema;

interface WorkflowFormStepperProps {
  tenantId: string;
  defaultValues?: WorkflowFormStepperType & WorkflowData;
}

// WorkflowFormStepper: Renders stepper and step content
const WorkflowFormStepper: FC<WorkflowFormStepperProps> = ({ tenantId, defaultValues }) => {
  const router = useRouter();
  const stepper = useStepper();
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertRequestWorkflow();
  const [state, setState] = useState<WorkflowData>({ nodes: [], edges: [] });
  const t = useTranslations('admin.workflow.form');

  // Get internationalized schema
  const workflowSchemaIntl = useWorkflowSchema();

  // Create a map of step IDs to internationalized schemas
  const schemasMap = useMemo(
    () => ({
      description: workflowSchemaIntl,
      transitions: z.object({}),
      finish: z.object({}),
    }),
    [workflowSchemaIntl]
  );

  // Create a custom resolver that dynamically selects the correct internationalized schema
  const dynamicResolver = useMemo(() => {
    return (values: any, context: any, options: any) => {
      const currentData = stepper.state.current.data;
      const currentSchema = schemasMap[currentData.id as keyof typeof schemasMap] || (currentData as { schema?: z.ZodType }).schema;
      const resolver = zodResolver(currentSchema ?? z.object({}));
      return resolver(values, context, options);
    };
  }, [stepper.state.current.data.id, schemasMap, stepper]);

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: dynamicResolver,
    defaultValues: defaultValues ? omit(defaultValues, ['nodes', 'edges']) : getWorkflowDefaultValue(),
  });

  // Clear errors when step changes
  useEffect(() => {
    form.clearErrors();
  }, [stepper.state.current.data.id, form]);

  const currentStepData = stepper.state.current.data;
  // Handle form submission
  const onSubmit = async () => {
    if (!stepper.state.isLast) {
      stepper.navigation.next();
      return;
    }

    const data = form.getValues() as WorkflowFormStepperType;

    startTransition(async () => {
      const promise = upsert({
        where: { id: data.id, tenantId },
        create: {
          tenantId,
          name: data.name,
          description: data.description,
          isDefault: data.isDefault,
          requestWorkflowStatus: {
            create: state.nodes.map((node) => ({
              tenantId,
              id: node.id,
              name: node.data.label,
              description: node.data.description || '',
              color: String(node.data.color.value),
              type: String(node.data.type.value),
              positionX: node.position.x,
              positionY: node.position.y,
            })),
          },
          requestWorkflowTransition: {
            create: state.edges.map((edge) => ({
              tenantId,
              id: edge.id,
              name: edge.data?.label || '',
              description: edge.data?.description || '',
              //priority: edge.data?.priority || 0,
              //maxDuration: edge.data?.maxDuration || 0,
              //notifyAfter: edge.data?.notifyAfter || 0,
              requiresApproval: edge.data?.requiresApproval,
              requiresJustification: edge.data?.requiresJustification,
              fromStatusId: edge.source,
              toStatusId: edge.target,
            })),
          },
        },
        update: {
          name: data.name,
          description: data.description,
          isDefault: data.isDefault,
          requestWorkflowStatus: {
            // Upsert para nodos (actualiza o crea)
            upsert: state.nodes.map((node) => ({
              where: { id: node.id, tenantId },
              update: {
                name: node.data.label,
                description: node.data.description || '',
                color: String(node.data.color.value),
                type: String(node.data.type.value),
                positionX: node.position.x,
                positionY: node.position.y,
                isActive: true,
              },
              create: {
                id: node.id,
                tenantId,
                name: node.data.label,
                description: node.data.description || '',
                color: String(node.data.color.value),
                type: String(node.data.type.value),
                positionX: node.position.x,
                positionY: node.position.y,
                isActive: true,
              },
            })),
            // Desactivar nodos removidos
            updateMany: {
              where: {
                id: { notIn: state.nodes.map((n) => n.id) },
                tenantId,
              },
              data: { isActive: false },
            },
          },
          requestWorkflowTransition: {
            // Upsert para transiciones
            upsert: state.edges.map((edge) => ({
              where: { id: edge.id, tenantId },
              update: {
                name: edge.data?.label || '',
                description: edge.data?.description || '',
                //priority: edge.data?.priority || 0,
                //maxDuration: edge.data?.maxDuration || 0,
                //notifyAfter: edge.data?.notifyAfter || 0,
                requiresApproval: edge.data?.requiresApproval,
                requiresJustification: edge.data?.requiresJustification,
                fromStatusId: edge.source,
                toStatusId: edge.target,
              },
              create: {
                id: edge.id,
                tenantId,
                name: edge.data?.label || '',
                description: edge.data?.description || '',
                //priority: edge.data?.priority || 0,
                //maxDuration: edge.data?.maxDuration || 0,
                //notifyAfter: edge.data?.notifyAfter || 0,
                requiresApproval: edge.data?.requiresApproval,
                requiresJustification: edge.data?.requiresJustification,
                fromStatusId: edge.source,
                toStatusId: edge.target,
              },
            })),
            deleteMany: {
              id: { notIn: state.edges.map((e) => e.id) },
              tenantId,
            },
          },
        },
      });

      toast.promise(promise, {
        loading: t('messages.saving'),
        success: (upsertResponse) => {
          router.push({ pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } });
          return t('messages.success', { name: upsertResponse?.name ?? 'N/A' });
        },
        error: (error) => {
          return t('messages.error', { error: error.message });
        },
      });
    });
  };

  const onDiagramSubmit = async ({ nodes, edges }: WorkflowData) => {
    setState({ nodes, edges });
    stepper.navigation.next();
  };

  return (
    <div className="flex flex-col flex-1 p-4" id="workflow-form-stepper">
      <ReactFlowProvider>
        <StepNavigationModern
          t={t as (key: string) => string}
          steps={stepper.lookup.getAll().map((s) => ({ id: s.id, label: s.label }))}
          currentId={currentStepData.id}
          getIndex={(id) => stepper.lookup.getIndex(id)}
          onStepClick={(id) => stepper.navigation.goTo(id)}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
            {error && <PrismaErrorAlert error={error} />}
            {stepper.flow.switch({
              description: () => <RequestWorkflowForm />,
              transitions: () => (
                <RequestFlowDiagramEditor
                  onBack={stepper.navigation.prev}
                  onSubmit={onDiagramSubmit}
                  defaultValues={defaultValues ? pick(defaultValues, ['nodes', 'edges']) : undefined}
                />
              ),
              finish: () => <WorkflowReview data={form.getValues() as WorkflowFormStepperType} state={state} />,
            })}
            {currentStepData.id !== 'transitions' && (
              <StepperNavigationButtons
                isPending={isPending}
                isFirstStep={stepper.state.isFirst}
                isLastStep={stepper.state.isLast}
                onPrev={stepper.navigation.prev}
                onReset={stepper.navigation.reset}
              />
            )}
          </form>
        </Form>
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowFormStepper;
