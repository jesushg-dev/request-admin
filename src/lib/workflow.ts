import { colorOptions, nodeColors, typeOptions } from '@/constants/workflow';
import { MarkerType } from '@xyflow/react';

import type { RequestWorkflowStatusType, RequestWorkflowTransitionType } from '@/types/prisma/workflow';
import { WorkflowEdge, WorkflowNode } from '@/components/common/workflow/workflow-stepper/flow-diagram-editor';

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
