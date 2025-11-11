import { colorOptions, nodeColors, typeOptions } from '@/constants/workflow';

import type { RequestWorkflowType } from '@/types/zenstackhq/workflow';
import { getInitialStatus, getStatusTransitions, getWorkflowStateMachine, transformStatusToNode, transformTransitionToEdge, validateTransition } from '@/lib/workflow';

describe('Workflow Functions', () => {
  const mockWorkflow: RequestWorkflowType = {
    id: 'workflow-1',
    name: 'Test Workflow',
    description: 'Test workflow description',
    isDefault: false,
    requireComments: true,
    notifyChanges: true,
    requestWorkflowStatus: [
      {
        id: 'status-1',
        name: 'Initial Status',
        type: 'initial',
        color: 'blue',
        positionX: 0,
        positionY: 0,
        description: 'Initial status description',
      },
      {
        id: 'status-2',
        name: 'In Progress',
        type: 'default',
        color: 'yellow',
        positionX: 200,
        positionY: 0,
        description: 'In progress status',
      },
      {
        id: 'status-3',
        name: 'Final Status',
        type: 'final',
        color: 'green',
        positionX: 400,
        positionY: 0,
        description: 'Final status description',
      },
    ],
    requestWorkflowTransition: [
      {
        id: 'transition-1',
        name: 'Start Progress',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        requiresApproval: true,
        requiresJustification: true,
        priority: 1,
        description: 'Transition description',
      },
      {
        id: 'transition-2',
        name: 'Complete',
        fromStatusId: 'status-2',
        toStatusId: 'status-3',
        requiresApproval: false,
        requiresJustification: false,
        priority: 2,
        description: null,
      },
    ],
  };

  describe('transformStatusToNode', () => {
    it('should transform initial status to input node', () => {
      const node = transformStatusToNode(mockWorkflow.requestWorkflowStatus[0]);
      expect(node).toEqual({
        id: 'status-1',
        position: { x: 0, y: 0 },
        data: {
          id: 'status-1',
          label: 'Initial Status',
          description: 'Initial status description',
          color: colorOptions.find((c) => c.value === 'blue') || colorOptions[0],
          type: typeOptions.find((t) => t.value === 'initial') || typeOptions[0],
        },
        style: {
          color: nodeColors.blue?.color || '#111827',
          background: nodeColors.blue?.bg || '#f3f4f6',
          border: `1px solid ${nodeColors.blue?.border || '#d1d5db'}`,
        },
        type: 'input',
      });
    });

    it('should transform final status to output node', () => {
      const node = transformStatusToNode(mockWorkflow.requestWorkflowStatus[2]);
      expect(node.type).toBe('output');
    });

    it('should transform normal status without type', () => {
      const node = transformStatusToNode(mockWorkflow.requestWorkflowStatus[1]);
      expect(node.type).toBeUndefined();
    });
  });

  describe('transformTransitionToEdge', () => {
    it('should transform transition to edge', () => {
      const edge = transformTransitionToEdge(mockWorkflow.requestWorkflowTransition[0]);
      expect(edge).toEqual({
        id: 'transition-1',
        source: 'status-1',
        target: 'status-2',
        label: 'Start Progress',
        animated: true,
        style: { stroke: '#94a3b8' },
        type: 'smoothstep',
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#94a3b8',
        },
        data: {
          id: 'transition-1',
          label: 'Start Progress',
          description: 'Transition description',
          requiresApproval: true,
          requiresJustification: true,
        },
      });
    });
  });

  describe('getStatusTransitions', () => {
    it('should return initial status when no current status', () => {
      const result = getStatusTransitions(mockWorkflow);
      expect(result.current.id).toBe('status-1');
      expect(result.allowedTransitions).toHaveLength(1);
      expect(result.allowedTransitions[0].id).toBe('status-2');
    });

    it('should return allowed transitions for current status', () => {
      const result = getStatusTransitions(mockWorkflow, 'status-2');
      expect(result.current.id).toBe('status-2');
      expect(result.allowedTransitions).toHaveLength(1);
      expect(result.allowedTransitions[0].id).toBe('status-3');
    });

    it('should return empty transitions for final status', () => {
      const result = getStatusTransitions(mockWorkflow, 'status-3');
      expect(result.current.id).toBe('status-3');
      expect(result.allowedTransitions).toHaveLength(0);
    });

    it('should throw error for invalid status', () => {
      expect(() => getStatusTransitions(mockWorkflow, 'invalid-status')).toThrow('Current status not found');
    });
  });

  describe('getInitialStatus', () => {
    it('should return initial status', () => {
      const status = getInitialStatus(mockWorkflow);
      expect(status.id).toBe('status-1');
    });

    it('should throw error when no initial status', () => {
      const workflowWithoutInitial = {
        ...mockWorkflow,
        requestWorkflowStatus: mockWorkflow.requestWorkflowStatus.filter((s) => s.type !== 'initial'),
      };
      expect(() => getInitialStatus(workflowWithoutInitial)).toThrow('No initial status found in workflow');
    });

    it('should throw error when multiple initial statuses', () => {
      const workflowWithMultipleInitial = {
        ...mockWorkflow,
        requestWorkflowStatus: [...mockWorkflow.requestWorkflowStatus, { ...mockWorkflow.requestWorkflowStatus[0], id: 'status-4' }],
      };
      expect(() => getInitialStatus(workflowWithMultipleInitial)).toThrow('Multiple initial statuses found in workflow');
    });
  });

  describe('validateTransition', () => {
    it('should validate initial transition', () => {
      expect(validateTransition(mockWorkflow, null, 'status-1')).toBe(true);
      expect(validateTransition(mockWorkflow, null, 'status-2')).toBe(false);
    });

    it('should validate normal transition', () => {
      expect(validateTransition(mockWorkflow, 'status-1', 'status-2')).toBe(true);
      expect(validateTransition(mockWorkflow, 'status-1', 'status-3')).toBe(false);
    });

    it('should not allow transition from final status', () => {
      expect(validateTransition(mockWorkflow, 'status-3', 'status-1')).toBe(false);
    });

    it('should return false for invalid statuses', () => {
      expect(validateTransition(mockWorkflow, 'invalid-status', 'status-2')).toBe(false);
      expect(validateTransition(mockWorkflow, 'status-1', 'invalid-status')).toBe(false);
    });
  });

  describe('getWorkflowStateMachine', () => {
    it('should return complete state machine', () => {
      const stateMachine = getWorkflowStateMachine(mockWorkflow);
      expect(stateMachine).toHaveLength(3);
      expect(stateMachine[0].transitions).toHaveLength(1);
      expect(stateMachine[1].transitions).toHaveLength(1);
      expect(stateMachine[2].transitions).toHaveLength(0);
    });
  });
});
