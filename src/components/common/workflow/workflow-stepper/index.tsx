'use client';

import React, { useState, useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertRequestWorkflow } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { ReactFlowProvider } from '@xyflow/react';
import { omit, pick } from 'lodash';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { StepNavigation } from '@/components/stepper/step-navigation';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { RequestFlowDiagramEditor, type WorkflowData } from './flow-diagram-editor';
import RequestWorkflowForm, { getWorkflowDefaultValue, workflowFormSchema } from './request-workflow-form';
import WorkflowReview from './workflow-review';

// Stepper definition
const { useStepper, utils } = defineStepper(
  { id: 'description', label: 'Description', schema: workflowFormSchema },
  { id: 'transitions', label: 'Transitions', schema: z.object({}) },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

export type WorkflowFormStepperType = z.infer<typeof workflowFormSchema>;

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

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
    defaultValues: defaultValues ? omit(defaultValues, ['nodes', 'edges']) : getWorkflowDefaultValue(),
  });

  // Handle form submission
  const onSubmit = async () => {
    if (!stepper.isLast) {
      stepper.next();
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
        loading: 'Saving workflow...',
        success: (upsertResponse) => {
          router.push({ pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } });
          return `Workflow ${upsertResponse?.name} created successfully`;
        },
        error: (error) => {
          return `Failed to save workflow: ${error.message}`;
        },
      });
    });
  };

  const onDiagramSubmit = async ({ nodes, edges }: WorkflowData) => {
    setState({ nodes, edges });
    stepper.next();
  };

  return (
    <div className="flex flex-col flex-1 p-4" id="workflow-form-stepper">
      <Card className="w-full flex flex-col flex-1 overflow-hidden">
        <ReactFlowProvider>
          <div className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden p-6">
            <StepNavigation steps={stepper.all} currentId={stepper.current.id} getIndex={utils.getIndex} onStepClick={stepper.goTo} />
            {/* Step Content */}
            {stepper.switch({
              description: () => (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-4 overflow-hidden">
                    {error && <PrismaErrorAlert error={error} />}
                    <div className="flex flex-1 overflow-y-hidden">
                      <ScrollArea className="w-full flex-1 overflow-y-hidden">
                        <RequestWorkflowForm />
                      </ScrollArea>
                    </div>
                    <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
                  </form>
                </Form>
              ),
              transitions: () => <RequestFlowDiagramEditor onBack={stepper.prev} onSubmit={onDiagramSubmit} defaultValues={defaultValues ? pick(defaultValues, ['nodes', 'edges']) : undefined} />,
              finish: () => (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-4 overflow-hidden">
                    {error && <PrismaErrorAlert error={error} />}
                    <div className="flex flex-1 overflow-y-hidden">
                      <WorkflowReview data={form.getValues() as WorkflowFormStepperType} state={state} />
                    </div>
                    <StepperNavigationButtons isPending={isPending} isFirstStep={stepper.isFirst} isLastStep={stepper.isLast} onPrev={stepper.prev} onReset={stepper.reset} />
                  </form>
                </Form>
              ),
            })}
          </div>
        </ReactFlowProvider>
      </Card>
    </div>
  );
};

export default WorkflowFormStepper;
