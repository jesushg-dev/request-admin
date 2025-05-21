import { colorOptions, nodeColors, typeOptions } from '@/constants/workflow';
import { MarkerType } from '@xyflow/react';

import type { RequestWorkflowStatusType, RequestWorkflowTransitionType, RequestWorkflowType } from '@/types/prisma/workflow';
import { WorkflowEdge, WorkflowNode } from '@/components/common/workflow/workflow-stepper/flow-diagram-editor';

type NextStatusWithTransition = RequestWorkflowStatusType & {
  requiresApproval: boolean;
  requiresJustification: boolean;
};

type StatusWithTransitions = {
  current: RequestWorkflowStatusType;
  allowedTransitions: NextStatusWithTransition[];
};

export const transformStatusToNode = (status: RequestWorkflowStatusType): WorkflowNode => ({
  id: status.id,
  position: { x: status.positionX, y: status.positionY },
  data: {
    id: status.id,
    label: status.name,
    description: status.description ?? undefined,
    color: colorOptions.find((c) => c.value === status.color) || colorOptions[0],
    type: typeOptions.find((t) => t.value === status.type) || typeOptions[0],
  },
  style: {
    color: nodeColors[status.color as keyof typeof nodeColors]?.color || '#111827',
    background: nodeColors[status.color as keyof typeof nodeColors]?.bg || '#f3f4f6',
    border: `1px solid ${nodeColors[status.color as keyof typeof nodeColors]?.border || '#d1d5db'}`,
  },
  type: status.type === 'initial' ? 'input' : status.type === 'final' ? 'output' : undefined,
});

export const transformTransitionToEdge = (transition: RequestWorkflowTransitionType): WorkflowEdge => ({
  id: transition.id,
  source: transition.fromStatusId,
  target: transition.toStatusId,
  label: transition.name,
  animated: true,
  style: { stroke: '#94a3b8' },
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#94a3b8',
  },
  data: {
    id: transition.id,
    label: transition.name,
    description: transition.description ?? undefined,
    requiresApproval: transition.requiresApproval,
    requiresJustification: transition.requiresJustification,
  },
});

// Get allowed transitions
export const getStatusTransitions = (workflow: RequestWorkflowType, currentStatusId?: string): StatusWithTransitions => {
  // If there is no current status, return initial
  if (!currentStatusId) {
    const initialStatus = getInitialStatus(workflow);
    return {
      current: initialStatus,
      allowedTransitions: getNextStatuses(workflow, initialStatus.id),
    };
  }

  const currentStatus = workflow.requestWorkflowStatus.find((s) => s.id === currentStatusId);
  if (!currentStatus) throw new Error('Current status not found');

  // If it is a final status, there are no transitions
  if (currentStatus.type === 'final') {
    return {
      current: currentStatus,
      allowedTransitions: [],
    };
  }

  // Use getNextStatuses to get transitions with extra fields
  return {
    current: currentStatus,
    allowedTransitions: getNextStatuses(workflow, currentStatusId),
  };
};

// Get unique initial status
export const getInitialStatus = (workflow: RequestWorkflowType) => {
  const initialStatuses = workflow.requestWorkflowStatus.filter((s) => s.type === 'initial');

  if (initialStatuses.length === 0) {
    throw new Error('No initial status found in workflow');
  }

  if (initialStatuses.length > 1) {
    throw new Error('Multiple initial statuses found in workflow');
  }

  return initialStatuses[0];
};

// Validate a transition
export const validateTransition = (workflow: RequestWorkflowType, fromStatusId: string | null, toStatusId: string): boolean => {
  // Initial transition
  if (!fromStatusId) {
    return getInitialStatus(workflow).id === toStatusId;
  }

  const fromStatus = workflow.requestWorkflowStatus.find((s) => s.id === fromStatusId);
  const toStatus = workflow.requestWorkflowStatus.find((s) => s.id === toStatusId);

  // Validate existence of statuses
  if (!fromStatus || !toStatus) return false;

  // Cannot transition from final status
  if (fromStatus.type === 'final') return false;

  // Validate transition in the workflow
  return workflow.requestWorkflowTransition.some((t) => t.fromStatusId === fromStatusId && t.toStatusId === toStatusId);
};

// Helper function to get next statuses
const getNextStatuses = (workflow: RequestWorkflowType, fromStatusId: string): NextStatusWithTransition[] => {
  return workflow.requestWorkflowTransition
    .filter((t) => t.fromStatusId === fromStatusId)
    .map((t) => {
      const status = workflow.requestWorkflowStatus.find((s) => s.id === t.toStatusId);
      if (!status) return null;
      return {
        ...status,
        requiresApproval: t.requiresApproval,
        requiresJustification: t.requiresJustification,
      };
    })
    .filter(Boolean) as NextStatusWithTransition[];
};

// Get complete state machine with type constraints
export const getWorkflowStateMachine = (workflow: RequestWorkflowType) => {
  return workflow.requestWorkflowStatus.map((status) => {
    const transitions =
      status.type === 'final'
        ? []
        : workflow.requestWorkflowTransition
            .filter((t) => t.fromStatusId === status.id)
            .map((t) => ({
              id: t.id,
              toStatus: workflow.requestWorkflowStatus.find((s) => s.id === t.toStatusId)!,
            }));

    return {
      ...status,
      transitions,
    };
  });
};
